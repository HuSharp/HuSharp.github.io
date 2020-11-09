---
layout: post
title:  " 《程序员代码面试指南》（十二）搜索二叉树BST"
date:   2020-10-31 16:41:08 +0800
categories:  算法&DS
tags: 算法  数据结构
author: Hu#
typora-root-url: ..
---

* content
{:toc}




### 查找树的分类 ST

![image-20201031233844877](/assets/blog_image/2020-10-31-Coder-Advanced4_BST/image-20201031233844877.png)

###  1、搜索二叉树

任一节点r的左(右)子树中，所有节点(若存在)均不大于(不小于) r

![image-20201031165116839](/assets/blog_image/2020-10-31-Coder-Advanced4_BST/image-20201031165116839.png)



删除算法

- 单分支情况
  	以如图 (a) 所示二叉搜索树为例。若欲删除节点 69 ，需首先通过 search( 69 ) 定位待删除节点( 69 )。因该节点的右子树为空，故只需将其替换为左孩子(64) ，则拓扑意义上的节点删除即告完成。当然，为保持二叉搜索树作为数据结构的完整性和一致性，还需更新全树的规模记录，释放被摘除的节点(69) ，并自下而上地逐个更新替代节点(64)历代祖先的高度。
    	不难理解，对于没有左孩子的目标节点，也可以对称地予以处理。当然，以上同时也已涵盖了左、右孩子均不存在(即目标节点为叶节点)的情况。

  ![image-20201031221424618](/assets/blog_image/2020-10-31-Coder-Advanced4_BST/image-20201031221424618.png)

​	那么，当目标节点的左、右孩子双全时，删除操作又该如何实施呢? 

- 双分支情况（用后继节点，当然可以用前驱节点）
  继续上例，设拟再删除二度节点 36 。如图 ( b )所示，首先调用 succ() 算法，找到该节点的直接后继(40)。然后，只需如图 (c) 所示交换二者的数据项，则可将后继节点等效地视作待删除的目标节点。不难验证，该后继节点必无左孩子，从而相当于转化为此前相对简单的情况。于是最后可如图(d)所示，将新的目标节点(36)替换为其右孩子(46)。
   	请注意，在中途互换数据项之后，这一局部如图(c)所示曾经一度并不满足顺序性。但这并不要紧——不难验证， 在按照上述方法完成整个删除操作之后，全树的顺序性必然又将恢复。同样地，除了更新全树规模记录和释放被摘除节点，此时也要更新一系列祖先节点的高度。不难验证，此时首个需要更新高度的祖先(53)，依然恰好由_hot指示。

  ​	值得注意的是，由于该点为双分支，所以其后继（前驱）必然为其子树中的某个节点。

  ![image-20201031221452062](/assets/blog_image/2020-10-31-Coder-Advanced4_BST/image-20201031221452062.png)



```
public class AbstractBinarySearchTree {
    
    public Node root;
    public int size;

    /**
     * @description: 
     * @param {Integer} value
     * @param {Node} parent
     * @param {Node} left
     * @param {Node} right
     * @return {*}
     */    
    public Node createNode(Integer value, Node parent, Node left, Node right) {
        return new Node(value, parent, left, right);
    }


    /**
     * @description: 进行 BST 的查找算法
     * @param {int} element
     * @return {*}
     */    
    public Node search(int element) {
        Node node = root;
        while (node != null && node.value != null && node.value != element) {
            if(element < node.value) {
                node = node.left;
            } else {
                node = node.right;
            }
        }

        return node;
    }

    /**
     * @description: BST 插入算法
     * @param {int} element to insert
     * @return new Node(element)
     */    
    public Node insert(int element) {
        
        if(root == null) {
            root = createNode(element, null, null, null); 
        }

        Node insertParentNode = null;
        Node searchTempNode = root;// 一直到 其为空，那么就返回其父节点（insert保存)

        while (searchTempNode != null && searchTempNode.value != null) {
            insertParentNode = searchTempNode;
            if(element < searchTempNode.value) {
                searchTempNode = searchTempNode.left;
            } else {
                searchTempNode = searchTempNode.right;
            }
        }

        // 至此 找到插入父节点
        Node newNode = createNode(element, insertParentNode, null, null);
        if(element < insertParentNode.value) {
            insertParentNode.left = newNode;
        } else {
            insertParentNode.right = newNode;
        }
        size++;
        return newNode;
    }

    public Node delete(int element) {
        Node deleteNode = search(element);// 首先判断是否存在
        if(deleteNode != null) {
            return delete(deleteNode);
        } else {
            return null;
        }

    }

    /**
     * @description: 判断是否有左右孩子， 删除该点， 进行替代 
     * @param {Node} deleteNode
     * @return New node that is in place of deleted node. Or null if element for
	 *         delete was not found.
     */    
    public Node delete(Node deleteNode) {
        if(deleteNode != null) {
            Node nodeToReturn = null;
            if (deleteNode.left == null) {// 左孩子为空
                nodeToReturn = transplant(deleteNode, deleteNode.right);
            } else if(deleteNode.right == null) {
                nodeToReturn = transplant(deleteNode, deleteNode.left);
            } else {//至此 说明为双节点， 需要先找到 后继点
                Node successorNode = getSuccessor(deleteNode);
                //若不为 delete 点的右节点， 
                // 应当直接将 succ 的右节点和 succ 交换即可， 
                // 因此 现在 succ 为漂流指针，但是不影响
                // 现在先将 succ 的 右指针指向 dele 的右指针
                // 之后在用 succ 取代 dele
                // 为什么需要单独拿出来呢， 因为若为 delete 右节点， 那么只需要改左节点， 右节点不用管
                if(successorNode.parent != deleteNode) {
                    transplant(successorNode, successorNode.right);
                    successorNode.right = deleteNode.right;
                    successorNode.right.parent = successorNode;
                }

                // 若 succ 就为 dele 的右节点， 那么交换之后， 更改 succ 的左指针指向即可。
                // 交换 deleteNode 和 successor 位置
                transplant(deleteNode, successorNode);
                successorNode.left = deleteNode.left;
                successorNode.left.parent = successorNode;
                nodeToReturn = successorNode;
            }
            size--;
            return nodeToReturn;
        }// 至此 说明没有deleteNode
        return null;
    }

    /**
     * @description: 替代函数，  
     *      Put one node from tree (newNode) to the place of another (nodeToReplace).
     * @param {Node} nodeToReplace
     * @param {Node} newNode
     * @return New replaced node.
     */    
    private Node transplant(Node nodeToReplace, Node newNode) {
        if(nodeToReplace.parent == null) {// 若为 根节点
            this.root = newNode;
        } else if(nodeToReplace == nodeToReplace.parent.left) {
            nodeToReplace.parent.left = newNode;
        } else {
            nodeToReplace.parent.right = newNode;
        }
        // 将 newNode parent 点置为 之前点的父节点
        if (newNode != null) {
            newNode.parent = nodeToReplace.parent;
        }
        return newNode;
    }

    public int getSuccessor(int element) {
        return getSuccessor(search(element)).value;
    }

    /* ---------------  PRIVATE HELPER METHOD --------------- */
    private Node getSuccessor(Node node) {
        if(node.right != null) {
            return getMin(node.right);
        } else {//说明右子树为空， 那么需要向上找到第一个是左孩子的父节点
            Node currentNode = node;
            Node parentNode = node.parent;
            while(parentNode != null && currentNode == parentNode.right) {
                currentNode = parentNode;
                parentNode = parentNode.parent;
            }
            return parentNode;
        }
    }

    protected Node getMin(Node node) {
        while(node.left != null) {
            node = node.left;
        }
        return node;
    }


	public static class Node {
        public Node(Integer value, Node parent, Node left, Node right) {
            super();
            this.value = value;
            this.parent = parent;
            this.left = left;
            this.right = right;
        }
        public Integer value;
		public Node parent;
		public Node left;
        public Node right;
    }
```





/*------------------------------------------ MARK 一下， 最近先提升一下 Codeing 能力， 再来看进阶（轻重缓急）-------------------------*/

此处为 左神进阶班 4-1

若要调节平衡性 BBST

BBST 将各个节点的左右子树高度，存在各个节点的结构体中

当每次插入一个节点时，会将其父节点、祖父节点...一直到 root 全部更改树的高度，以此判断是否破坏平衡性。

基本动作：左旋右旋

右旋

![image-20201031224018080](/assets/blog_image/2020-10-31-Coder-Advanced4_BST/image-20201031224018080.png)

左旋

![image-20201031224138160](/assets/blog_image/2020-10-31-Coder-Advanced4_BST/image-20201031224138160.png)



AVL树





SBT其实是英文Size balanced tree