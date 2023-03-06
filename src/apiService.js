const getMindmaps = () => {
  const mindmaps = localStorage.getItem('mindmaps')

  if (!mindmaps) {
    return []
  }

  return JSON.parse(mindmaps)
}

const saveMindmaps = (mindmaps) => {
  localStorage.setItem('mindmaps', JSON.stringify(mindmaps))
}

export default { getMindmaps, saveMindmaps }
