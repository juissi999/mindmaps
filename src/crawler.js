import { v4 } from 'uuid'

const crawlJson = (
  jsonObj,
  parentId,
  label,
  newNodes,
  newEdges,
  level,
  leafStyle,
  styles
) => {
  // recursive crawling function that goes through JSON

  const isArray = Array.isArray(jsonObj)
  const isObj = isObject(jsonObj)
  const nodeId = v4()

  // edge to parent when not root element
  if (parentId) {
    newEdges.push({ from: parentId, to: nodeId, arrows: 'to', label })
  }

  const newNode = {
    id: nodeId,
    level,
    font: parentId ? undefined : styles.ROOTFONT
  }

  // process different node-types of JSON
  if (isArray) {
    let color = styles.ARRAYCOLOR
    if (jsonObj.length === 0) {
      color = styles.EMPTYCOLOR
    }

    newNodes.push({
      ...newNode,
      label: 'Array',
      shape: styles.ARRAYSHAPE,
      color: parentId ? color : styles.ROOTCOLOR
    })
    jsonObj.map((item) =>
      crawlJson(
        item,
        nodeId,
        null,
        newNodes,
        newEdges,
        level + 1,
        leafStyle,
        styles
      )
    )
  } else if (isObj) {
    let color = styles.OBJECTCOLOR
    if (Object.keys(jsonObj).length === 0) {
      color = styles.EMPTYCOLOR
    }

    newNodes.push({
      ...newNode,
      label: 'Object',
      color: parentId ? color : styles.ROOTCOLOR,
      shape: styles.OBJECTSHAPE
    })
    const keys = Object.keys(jsonObj)
    keys.map((key) =>
      crawlJson(
        jsonObj[key],
        nodeId,
        key,
        newNodes,
        newEdges,
        level + 1,
        leafStyle,
        styles
      )
    )
  } else {
    if (['show', 'value'].find((el) => el === leafStyle)) {
      // eliminate null value doesnt have toString()-method
      const valueStr = jsonObj === null ? 'null' : jsonObj.toString()

      // if of type string, add quotes to make it easier to detect type
      const formattedValueStr = isString(jsonObj) ? `'${valueStr}'` : valueStr

      newNodes.push({
        ...newNode,
        color: styles.LEAFCOLOR,
        shape: styles.LEAFSHAPE,
        label: leafStyle === 'value' ? formattedValueStr : undefined
      })
    }
  }
}

const isObject = (obj) => {
  // test if object is an object and not e.g. array, return bool
  return Object.prototype.toString.call(obj) === '[object Object]'
}

const isString = (obj) => {
  return Object.prototype.toString.call(obj) === '[object String]'
}

export { crawlJson }
