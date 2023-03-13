const OUTSIDEORIGINATORRADIUS = 30

const createPopupBox = (container, commitCallback, cancelCallback) => {
  const createButton = (txt, classes, callback) => {
    const btn = document.createElement('button')
    btn.appendChild(document.createTextNode(txt))
    btn.addEventListener('click', callback)
    btn.setAttribute('class', 'mr-1 my-1 mw-2 pointer ' + classes)
    return btn
  }

  const containerElement = document.getElementById(container)
  containerElement.setAttribute('style', 'position: relative;')

  const popupBlock = document.createElement('div')
  popupBlock.setAttribute(
    'style',
    'display:none; position: absolute; background-color: #C2FABC; top:45%; left:27%; padding:20px;'
  )
  popupBlock.setAttribute('width', '120px')

  popupBlock.setAttribute('id', 'newNodePopUp')
  const inputTxtBox = document.createElement('input')
  // inputTxtBox.setAttribute('value', NEWNODETXT)
  inputTxtBox.addEventListener('keypress', (event) => {
    if (event.key == 'Enter') {
      commitCallback()
    }
  })

  popupBlock.appendChild(inputTxtBox)
  popupBlock.appendChild(createButton('save', '', commitCallback))
  popupBlock.appendChild(createButton('cancel', '', cancelCallback))

  containerElement.appendChild(popupBlock)

  return { popupBlock, inputTxtBox }
}

const radialButtonLocations = [
  {
    x: OUTSIDEORIGINATORRADIUS,
    y: OUTSIDEORIGINATORRADIUS
  },
  {
    x: -OUTSIDEORIGINATORRADIUS,
    y: -OUTSIDEORIGINATORRADIUS
  },
  {
    x: OUTSIDEORIGINATORRADIUS,
    y: -OUTSIDEORIGINATORRADIUS
  },
  {
    x: -OUTSIDEORIGINATORRADIUS,
    y: OUTSIDEORIGINATORRADIUS
  },
  {
    x: -OUTSIDEORIGINATORRADIUS,
    y: 0
  },
  {
    x: OUTSIDEORIGINATORRADIUS,
    y: 0
  },
  {
    x: 0,
    y: -OUTSIDEORIGINATORRADIUS
  },
  {
    x: 0,
    y: OUTSIDEORIGINATORRADIUS
  }
]

export { createPopupBox, radialButtonLocations }
