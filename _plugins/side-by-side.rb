require 'nokogiri'

module Jekyll
  module SideBySideFilter
    def split_list_for_notes(list_node)
      items = list_node.css('> li')
      list_type = list_node.name

      # Check if next sibling is a NOTE paragraph
      next_sibling = list_node.next_element
      has_note_following = next_sibling && next_sibling.text.strip.start_with?('[NOTE]')

      if has_note_following && items.length > 1
        # Split: all items except last go in one list, last item in its own list
        first_items = items[0..-2]
        last_item = items[-1]

        # Push the first group as one list
        first_list = "<#{list_type}>#{first_items.map(&:to_s).join}</#{list_type}>"
        @elements.push(first_list)

        # Push the last item as its own list (will pair with the NOTE)
        last_list = "<#{list_type}>#{last_item.to_s}</#{list_type}>"
        @elements.push(last_list)
      else
        # No NOTE following, push the entire list as-is
        @elements.push(list_node.to_s)
      end
    end

    def side_by_side_with_subtitle(input, mode, subtitle)
      @doc = Nokogiri::HTML::DocumentFragment.parse(input)
      @elements = []
      @doc.children.each do |node|
        # For lists with footnotes, split before the item with [NOTE] reference
        if (node.name == 'ul' || node.name == 'ol') && mode == 'comment'
          split_list_for_notes(node)
        else
          @elements.push(node.to_s)
        end
      end
      @result = '<table class="side-by-side"><tbody>'
      if mode == 'translation'
        @elements.select { |e| !e.strip.empty? }.each_slice(2).to_a.each do |e|
          @result << %(<tr><td>#{e[0]}</td><td>#{e[1]}</td></tr>)
          if !subtitle.strip.empty? and e[0].include? '<h1'
            @result << %(<tr><td>#{subtitle}</td><td></td></tr>)
          end
        end
      elsif mode == 'comment'
        @opened = false
        @elements.select { |e| !e.strip.empty? }.each do |e|
          if e.slice! '[NOTE] '
            # Convert footnote references [^1] to styled markers
            e = e.gsub(/\[\^(\d+)\]/, '<sup class="note-ref">\1</sup>')
            # Output note immediately with the currently open row
            if @opened
              @result << %(<td>#{e}</td></tr>)
              @opened = false
            end
          else
            # Convert footnote references [^1] to styled markers in content
            e = e.gsub(/\[\^(\d+)\]/, '<sup class="note-ref">\1</sup>')
            # Close any previously opened row with empty comment
            if @opened
              @result << %(<td></td></tr>)
            end
            # Open new row with this element
            if e.include? '<h1'
              @result << %(<tr><td>#{e}#{subtitle}</td>)
            else
              @result << %(<tr><td>#{e}</td>)
            end
            @opened = true
          end
        end
        # Close any remaining open row
        if @opened
          @result << %(<td></td></tr>)
        end
      end
      @result << '</table></tbody>'
      return @result
    end
  end
end

Liquid::Template.register_filter(Jekyll::SideBySideFilter)