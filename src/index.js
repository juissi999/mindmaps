import { v4 as uuidv4 } from 'uuid'
import 'juicycss/index.css'

import './style.css'
import mindmapGraph from './mindmapGraph'
import apiService from './apiService'

const STYLES = {
  ROOTCOLOR: '#a8b6dd',
  ARRAYCOLOR: '#6E6EFD',
  OBJECTCOLOR: '#fcfcab', //'#FFFF00'
  EMPTYCOLOR: '#FB7E81',
  LEAFCOLOR: '#C2FABC',
  ARRAYSHAPE: 'box',
  OBJECTSHAPE: 'circle',
  LEAFSHAPE: 'ellipse',
  ROOTFONT: { size: 25 }
}

const APPID = 'app'

let mindMaps = []

let listElement = null
let selectedMap = null
let mindmap = null

const getCurrentMapObj = () => {
  return mindMaps.find((mm) => mm.id === selectedMap)
}

const refreshGraph = () => {
  try {
    document.getElementById('statustxt').textContent = ''

    const currentMapObj = getCurrentMapObj()

    if (!currentMapObj) {
      return
    }
    const { nodes, edges } = currentMapObj

    // render graph
    mindmap.set(nodes, edges)
  } catch (error) {
    // something went wrong, create empty graph
    document.getElementById('statustxt').textContent = `${error}`
    mindmap.clear()
  }
}

const addNewMindMap = () => {
  mindMaps.push({
    id: uuidv4(),
    nodes: [
      {
        id: '1df6aaf4-10cb-429f-9ff8-2fe0ac2d6287',
        font: {
          size: 20
        },
        label: 'Root',
        color: '#dae0f1',
        shape: 'circle'
      }
    ],
    edges: []
  })
  createMindMapList()
}

const onMindmapUpdate = (data) => {
  const map = getCurrentMapObj()

  map.nodes = data.nodes
  map.edges = data.edges

  apiService.saveMindmaps(mindMaps)
  createMindMapList()
}

const selectMap = (id) => {
  selectedMap = id
  createMindMapList()
  refreshGraph()
}

const createMindMapList = () => {
  listElement.innerHTML = ''
  // `<div>${mm.id}</div>`).join("")
  mindMaps.forEach((mm) => {
    const listEl = document.createElement('div')
    if (selectedMap === mm.id) {
      listEl.innerHTML = `<b>${mm.nodes[0].label}</b>`
    } else {
      // listEl.innerHTML = mm.id
      listEl.innerHTML = mm.nodes[0].label
      listEl.appendChild(
        createButton('Select', 'jgreen', () => selectMap(mm.id))
      )
    }
    listElement.appendChild(listEl)
  })
}

window.addEventListener('load', () => {
  // define callback-functions for DOM-elements
  createLayout(APPID)

  mindMaps = apiService.getMindmaps()

  // initial graph
  mindmap = new mindmapGraph('graph', [], [], onMindmapUpdate)

  if (mindMaps.length > 0) {
    selectedMap = mindMaps[0].id
    refreshGraph()
  }

  createMindMapList()
})

const createLayout = (elId) => {
  const app = document.getElementById(elId)
  const container = document.createElement('div')

  container.setAttribute('class', 'container')

  const title = document.createElement('h2')
  title.innerText = 'mindmaps'
  container.appendChild(title)

  const block1 = document.createElement('div')
  block1.setAttribute('class', 'my-2')
  block1.innerHTML = '<span id="statustxt" class="error"></span>'
  container.appendChild(block1)

  const block2 = document.createElement('div')
  block2.setAttribute('class', 'my-2')
  container.appendChild(block2)
  listElement = block2

  const block3 = document.createElement('div')
  block3.setAttribute('class', 'my-2')

  block3.appendChild(createButton('New mindmap', '', addNewMindMap))
  // block3.appendChild(createButton('New node', '', addNewNode))

  container.appendChild(block3)

  const graph = document.createElement('div')
  graph.setAttribute('class', 'my-2')
  graph.setAttribute('id', 'graph')
  container.appendChild(graph)

  const block6 = document.createElement('div')
  block6.setAttribute('class', 'my-2')
  block6.innerHTML = `<a href="https://github.com/juissi999/jsonviz">juissi999@github</a>`
  container.appendChild(block6)

  app.appendChild(container)
}

const createButton = (txt, classes, callback) => {
  const btn = document.createElement('button')
  btn.appendChild(document.createTextNode(txt))
  btn.addEventListener('click', callback)
  btn.setAttribute('class', 'mr-1 my-1 mw-2 pointer ' + classes)
  return btn
}
