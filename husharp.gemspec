# frozen_string_literal: true

Gem::Specification.new do |s|
  s.name          = 'HuSharp'
  s.version       = '0.0.1'
  s.license       = 'MIT'
  s.authors       = ['HuSharp', 'GitHub, Inc.']
  s.summary       = 'HuSharp\'s Personal Pages'

  s.files         = `git ls-files -z`.split("\x0").select do |f|
    f.match(%r{^((_includes|_layouts|_sass|assets)/|(LICENSE|README)((\.(txt|md|markdown)|$)))}i)
  end

  s.platform = Gem::Platform::RUBY
  s.add_runtime_dependency 'jekyll', '> 3.5', '< 5.0'
  s.add_runtime_dependency 'jekyll-seo-tag', '~> 2.0'
end
