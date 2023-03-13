import { Network } from 'vis-network'
import { DataSet } from 'vis-data'
import { v4 as uuidv4 } from 'uuid'

import {
  createPopupBox,
  radialButtonLocations,
  formatText,
  clearTextFormatting
} from './utils.js'

const CONTROLTIMEOUT = 5000
const NEWNODETXT = 'type your text'
const CHARACTERS_IN_ROW = 20

class mindmapGraph {
  constructor(container, updateCallback) {
    this.updateCallback = updateCallback
    let options = {}

    this.nodes = new DataSet([])
    this.edges = new DataSet([])

    this.controlNodes = []
    this.controlEdges = []
    this.controlRootNodeId = null
    this.controlTimeoutHandle = null
    this.txtEditMode = null

    // create a network
    const data = {
      nodes: this.nodes,
      edges: this.edges
    }

    const click = (event) => {
      const userClickedANode = 0 < event.nodes.length
      if (!userClickedANode) {
        return
      }

      const clickOriginatorNode = event.nodes[0]
      const originatorNodeX = event.pointer.canvas.x
      const originatorNodeY = event.pointer.canvas.y

      const wasControlNodeClicked =
        this.controlNodes.find((cNode) => cNode.id === clickOriginatorNode) !==
        undefined

      if (wasControlNodeClicked) {
        this.handleControlNodeClick(
          clickOriginatorNode,
          originatorNodeX,
          originatorNodeY
        )
      } else {
        this.handleRegularNodeClick(
          clickOriginatorNode,
          originatorNodeX,
          originatorNodeY
        )
      }
    }

    const containerElement = document.getElementById(container)
    this.graph = new Network(containerElement, data, options).on('click', click)

    const hideInputTxtPopup = () => {
      this.popupBlock.setAttribute(
        'style',
        'display:none; position:absolute; background-color:#C2FABC; top:45%; left:27%; padding:20px;'
      )
    }

    const commitInputTxt = () => {
      const { originatorNodeX, originatorNodeY, color, parentNodeId } =
        this.editedNodeInformation

      if (this.txtEditMode === 'new') {
        this.createNewNodeAndPathToIt(
          originatorNodeX,
          originatorNodeY,
          this.inputTxtBox.value,
          parentNodeId,
          2,
          color,
          'box'
        )
      } else if (this.txtEditMode === 'edit') {
        const parentNode = this.findNode(parentNodeId)
        this.updateNodeLabel(parentNode[0], this.inputTxtBox.value)
      }

      hideInputTxtPopup()
      this.updateCallback(this.getDataSet())
    }

    const { popupBlock, inputTxtBox } = createPopupBox(
      container,
      commitInputTxt,
      hideInputTxtPopup
    )
    this.popupBlock = popupBlock
    this.inputTxtBox = inputTxtBox

    this.editedNodeInformation = {}
  }

  displayAndSelectInputTxtPopup() {
    this.popupBlock.setAttribute(
      'style',
      'display:visible; position: absolute; background-color: #C2FABC; top:45%; left:27%; padding:20px;'
    )
    this.inputTxtBox.focus()
    this.inputTxtBox.select()
  }

  createNewNodeAndPathToIt(x, y, label, fromNodeId, edgeValue, color, shape) {
    const newNodeId = uuidv4()
    const newEdgeId = uuidv4()
    this.addNode({
      id: newNodeId,
      color: color,
      shape,
      label,
      x,
      y
    })

    this.addEdge({
      from: fromNodeId,
      to: newNodeId,
      id: newEdgeId,
      value: edgeValue
    })

    return { nodeId: newNodeId, edgeId: newEdgeId }
  }

  updateNodeLabel(node, newLabel) {
    node.label = formatText(newLabel, CHARACTERS_IN_ROW)
    this.nodes.updateOnly(node)
  }

  addNode(node) {
    this.nodes.add({
      ...node,
      label: formatText(node.label, CHARACTERS_IN_ROW)
    })
  }

  addEdge(edge) {
    this.edges.add(edge)
  }

  deleteNode(nodeId) {
    this.nodes.remove({ id: nodeId })
  }

  clear() {
    this.nodes.clear()
    this.edges.clear()
  }

  set(nodes, edges) {
    nodes = nodes.map((node) => {
      return {
        ...node,
        label: formatText(node.label, CHARACTERS_IN_ROW)
      }
    })

    this.nodes = new DataSet(nodes)
    this.edges = new DataSet(edges)
    this.graph.setData({ nodes: this.nodes, edges: this.edges })
  }

  getDataSet() {
    return {
      nodes: this.nodes.get().map((node) => {
        return { ...node, label: clearTextFormatting(node.label) }
      }),
      edges: this.edges.get()
    }
  }

  setupControlButtons(clickOriginatorNode, originatorNodeX, originatorNodeY) {
    const shuffledButtonLocations = [...radialButtonLocations]
      .map((value) => ({ value, sort: Math.random() }))
      .sort((a, b) => a.sort - b.sort)
      .map(({ value }) => value)

    const node1 = this.createNewNodeAndPathToIt(
      originatorNodeX + shuffledButtonLocations[0].x,
      originatorNodeY + shuffledButtonLocations[0].y,
      'New node',
      clickOriginatorNode,
      2,
      '#C2FABC',
      'ellipse'
    )

    this.controlNodes.push({
      type: 'newNode',
      id: node1.nodeId,
      parent: clickOriginatorNode
    })
    this.controlEdges.push(node1.edgeId)

    const node2 = this.createNewNodeAndPathToIt(
      originatorNodeX + shuffledButtonLocations[1].x,
      originatorNodeY + shuffledButtonLocations[1].y,
      'Change text',
      clickOriginatorNode,
      2,
      '#50DAB3',
      'ellipse'
    )

    this.controlNodes.push({
      type: 'editText',
      id: node2.nodeId,
      parent: clickOriginatorNode
    })
    this.controlEdges.push(node2.edgeId)

    const node3 = this.createNewNodeAndPathToIt(
      originatorNodeX + shuffledButtonLocations[2].x,
      originatorNodeY + shuffledButtonLocations[2].y,
      'Delete node',
      clickOriginatorNode,
      2,
      '#FFb3b3',
      'ellipse'
    )

    this.controlNodes.push({
      type: 'deleteNode',
      id: node3.nodeId,
      parent: clickOriginatorNode
    })
    this.controlEdges.push(node3.edgeId)

    this.controlTimeoutHandle = setTimeout(() => {
      this.clearControlButtons()
    }, CONTROLTIMEOUT)

    this.controlRootNodeId = clickOriginatorNode
  }

  clearControlButtons() {
    this.controlNodes.forEach((controlNode) => {
      this.nodes.remove({ id: controlNode.id })
    })
    this.controlNodes = []

    this.controlEdges.forEach((controlEdgeId) => {
      this.edges.remove({ id: controlEdgeId })
    })
    this.controlEdges = []

    this.controlRootNodeId = null
    this.controlTimeoutHandle = null
  }

  handleRegularNodeClick(
    clickOriginatorNode,
    originatorNodeX,
    originatorNodeY
  ) {
    const controlButtonsExist = this.controlTimeoutHandle !== null

    if (controlButtonsExist) {
      clearTimeout(this.controlTimeoutHandle)
      const userClickedTheSameOriginatorNodeAgain =
        this.controlRootNodeId === clickOriginatorNode

      if (userClickedTheSameOriginatorNodeAgain) {
        this.controlTimeoutHandle = setTimeout(() => {
          this.clearControlButtons()
        }, CONTROLTIMEOUT)
        return
      } else {
        this.clearControlButtons()
      }
    }
    this.setupControlButtons(
      clickOriginatorNode,
      originatorNodeX,
      originatorNodeY
    )
  }

  handleControlNodeClick(
    clickOriginatorNode,
    originatorNodeX,
    originatorNodeY
  ) {
    const controlNode = this.controlNodes.find(
      (controlNode) => controlNode.id === clickOriginatorNode
    )
    const parentNode = this.findNode(controlNode.parent)

    clearTimeout(this.controlTimeoutHandle)
    this.controlTimeoutHandle = null

    this.editedNodeInformation = {
      originatorNodeX,
      originatorNodeY,
      parentNodeId: controlNode.parent,
      color: '#dae0f1'
    }

    if (controlNode.type === 'newNode') {
      this.inputTxtBox.value = NEWNODETXT
      this.txtEditMode = 'new'
      this.displayAndSelectInputTxtPopup()
    } else if (controlNode.type === 'editText') {
      this.inputTxtBox.value = clearTextFormatting(parentNode[0].label)
      this.txtEditMode = 'edit'
      this.displayAndSelectInputTxtPopup()
    } else if (controlNode.type === 'deleteNode') {
      this.deleteNode(controlNode.parent)
      this.updateCallback(this.getDataSet())
    }

    this.clearControlButtons()
  }

  findNode(nodeToFind) {
    return this.nodes.get({
      filter: function (item) {
        return item.id === nodeToFind
      }
    })
  }
}

export default mindmapGraph
