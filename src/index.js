import mindmapGraph from './mindmapGraph'
import 'juicycss/index.css'
import './style.css'
import { v4 as uuidv4 } from 'uuid'

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

const mindMaps = [
  {
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
      },
      {
        id: 'ea8b4c30-ca37-4898-855f-ef9a82a88a34',
        label: 'test',
        shape: 'box',
        color: '#dae0f1'
      },
      {
        id: 'db987ff6-d3c0-4436-94ec-8ea99a19b798',
        label: 'test2',
        color: '#dae0f1',
        shape: 'box' // 'ellipse' 'circle' 'box'
      }
    ],
    edges: [
      {
        from: '1df6aaf4-10cb-429f-9ff8-2fe0ac2d6287',
        to: 'ea8b4c30-ca37-4898-855f-ef9a82a88a34',
        id: '4b9324aa-1875-4ef9-8045-2203273bdbb5',
        value: 2
      },
      {
        from: '1df6aaf4-10cb-429f-9ff8-2fe0ac2d6287',
        to: 'db987ff6-d3c0-4436-94ec-8ea99a19b798',
        id: '4b9a24aa-1875-4ef9-8045-2203273bdbb5',
        value: 2
      }
    ]
  }
]

let listElement = null
let selectedMapElement = null
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
  renderList()
}

// const addNewNode = () => {
//   const map = getCurrentMapObj()
//   const newNode = {
//     id: uuidv4(),
//     color: '#C2FABC',
//     shape: 'ellipse',
//     label: "'Finland'"
//   }
//   // renderList()
//   mindmap.addNode(newNode)
//   map.nodes = mindmap.getNodes()
// }

const onMindmapUpdate = (data) => {
  const map = getCurrentMapObj()

  map.nodes = data.nodes
  map.edges = data.edges
}

const selectMap = (id) => {
  selectedMap = id
  renderList()
  refreshGraph()
}

const renderList = () => {
  listElement.innerHTML = ''
  // `<div>${mm.id}</div>`).join("")
  mindMaps.forEach((mm) => {
    const listEl = document.createElement('div')
    if (selectedMap === mm.id) {
      listEl.innerHTML = `<b>${mm.id}</b>`
    } else {
      listEl.innerHTML = mm.id
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

  // load maps
  renderList()

  // initial graph
  mindmap = new mindmapGraph('graph', [], [], onMindmapUpdate)
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
