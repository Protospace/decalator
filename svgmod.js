function replaceText(node, text) {
  node.children()[0].node.textContent = text;
  return node;
}

function replaceBoxedText(node, text) {

}

function replaceNode(node, newNode) {

}

module.exports = {
  replaceText,
  replaceBoxedText,
  replaceNode
}

