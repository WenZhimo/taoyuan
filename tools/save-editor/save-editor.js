const ENCRYPTION_KEY = 'taoyuanxiang_2024_secret'
const QUALITY_NAMES = {
  normal: '普通',
  fine: '优质',
  excellent: '精品',
  supreme: '极品'
}
const SEASON_NAMES = {
  spring: '春',
  summer: '夏',
  autumn: '秋',
  winter: '冬'
}
const WEATHER_NAMES = {
  sunny: '晴',
  rainy: '雨',
  stormy: '雷雨',
  snowy: '雪',
  windy: '大风',
  green_rain: '绿雨'
}
const CATEGORY_NAMES = {
  seed: '种子',
  crop: '作物',
  fish: '鱼类',
  ore: '矿石',
  gem: '宝石',
  gift: '礼物',
  food: '食物',
  material: '材料',
  misc: '杂项',
  processed: '加工品',
  machine: '机器',
  sprinkler: '洒水器',
  fertilizer: '肥料',
  animal_product: '畜产品',
  sapling: '树苗',
  fruit: '水果',
  bait: '鱼饵',
  tackle: '钓具',
  bomb: '炸弹',
  fossil: '化石',
  artifact: '古物',
  weapon: '武器',
  ring: '戒指',
  hat: '帽子',
  shoe: '鞋子'
}
const ITEM_CATALOG = Array.isArray(window.TAOYUAN_ITEM_CATALOG) ? window.TAOYUAN_ITEM_CATALOG : []

let saveData = null
let sourceName = 'taoyuan-save.tyx'

const $ = selector => document.querySelector(selector)
const $$ = selector => Array.from(document.querySelectorAll(selector))

const statusEl = $('#status')
const summaryEl = $('#summary')
const jsonEditor = $('#jsonEditor')

const setStatus = (message, type = '') => {
  statusEl.textContent = message
  statusEl.className = `status ${type}`.trim()
}

const setEnabled = enabled => {
  for (const id of ['applyForm', 'exportSave', 'exportJson', 'formatJson', 'applyJson', 'addItem', 'addManualItem']) {
    $(`#${id}`).disabled = !enabled
  }
}

const escapeHtml = value => {
  return String(value ?? '')
    .replaceAll('&', '&amp;')
    .replaceAll('<', '&lt;')
    .replaceAll('>', '&gt;')
    .replaceAll('"', '&quot;')
    .replaceAll("'", '&#039;')
}

const getPath = (obj, path) => {
  return path.split('.').reduce((current, key) => current?.[key], obj)
}

const ensurePath = (obj, keys) => {
  let current = obj
  for (const key of keys.slice(0, -1)) {
    if (!current[key] || typeof current[key] !== 'object') current[key] = {}
    current = current[key]
  }
  return current
}

const setPath = (obj, path, value) => {
  const keys = path.split('.')
  const target = ensurePath(obj, keys)
  target[keys[keys.length - 1]] = value
}

const parseFieldValue = input => {
  if (input.type === 'number') {
    if (input.value === '') return null
    const number = Number(input.value)
    return Number.isInteger(number) ? number : number
  }
  return input.value
}

const decryptSave = raw => {
  const bytes = CryptoJS.AES.decrypt(raw.trim(), ENCRYPTION_KEY)
  const json = bytes.toString(CryptoJS.enc.Utf8)
  if (!json) throw new Error('解密失败：这不是有效的桃源乡 .tyx 存档。')
  return JSON.parse(json)
}

const encryptSave = data => {
  return CryptoJS.AES.encrypt(JSON.stringify(data), ENCRYPTION_KEY).toString()
}

const downloadText = (filename, text, type = 'application/octet-stream') => {
  const blob = new Blob([text], { type })
  const url = URL.createObjectURL(blob)
  const link = document.createElement('a')
  link.href = url
  link.download = filename
  document.body.appendChild(link)
  link.click()
  link.remove()
  URL.revokeObjectURL(url)
}

const formatHour = hour => {
  if (typeof hour !== 'number') return '未知时间'
  const whole = Math.floor(hour)
  const minute = Math.round((hour - whole) * 60)
  const displayHour = whole >= 24 ? whole - 24 : whole
  return `${String(displayHour).padStart(2, '0')}:${String(minute).padStart(2, '0')}`
}

const refreshSummary = () => {
  if (!saveData) {
    summaryEl.textContent = '尚未载入存档。'
    summaryEl.className = 'summary empty'
    return
  }
  const player = saveData.player ?? {}
  const game = saveData.game ?? {}
  const inventory = saveData.inventory?.items ?? []
  summaryEl.className = 'summary'
  summaryEl.innerHTML = [
    `<strong>${player.playerName ?? '未命名'}</strong>`,
    `第 ${game.year ?? '?'} 年 ${SEASON_NAMES[game.season] ?? game.season ?? '?'} 第 ${game.day ?? '?'} 天`,
    `${formatHour(game.hour)}，${WEATHER_NAMES[game.weather] ?? game.weather ?? '未知天气'}`,
    `铜钱 ${player.money ?? 0}，体力 ${player.stamina ?? 0}/${player.maxStamina ?? 0}`,
    `背包 ${inventory.length} 格物品`
  ].join('<br />')
}

const refreshForm = () => {
  if (!saveData) return
  for (const input of $$('[data-path]')) {
    const value = getPath(saveData, input.dataset.path)
    input.value = value ?? ''
  }
  jsonEditor.value = JSON.stringify(saveData, null, 2)
  refreshSummary()
  refreshInventory()
}

const applyFormToData = () => {
  if (!saveData) return
  for (const input of $$('[data-path]')) {
    setPath(saveData, input.dataset.path, parseFieldValue(input))
  }
  jsonEditor.value = JSON.stringify(saveData, null, 2)
  refreshSummary()
  refreshInventory()
  setStatus('已应用表单修改。记得导出新的 .tyx。', 'ok')
}

const applyJsonToData = () => {
  try {
    const parsed = JSON.parse(jsonEditor.value)
    saveData = parsed
    refreshForm()
    setStatus('JSON 已应用到表单。', 'ok')
  } catch (error) {
    setStatus(`JSON 格式错误：${error.message}`, 'error')
  }
}

const getInventory = () => {
  if (!saveData.inventory) saveData.inventory = {}
  if (!Array.isArray(saveData.inventory.items)) saveData.inventory.items = []
  return saveData.inventory.items
}

const refreshInventory = () => {
  const container = $('#inventoryList')
  if (!saveData) {
    container.textContent = '载入存档后显示背包物品。'
    container.className = 'inventory-list empty'
    return
  }
  const items = getInventory()
  if (!items.length) {
    container.textContent = '背包为空。'
    container.className = 'inventory-list empty'
    return
  }
  container.className = 'inventory-list'
  container.innerHTML = ''
  items.slice(0, 200).forEach((item, index) => {
    const row = document.createElement('div')
    row.className = 'inventory-row'
    row.innerHTML = `
      <div><strong>${item.itemId}</strong>${item.locked ? '（锁定）' : ''}</div>
      <div>数量 ${item.quantity}</div>
      <div>${QUALITY_NAMES[item.quality] ?? item.quality ?? '普通'}</div>
      <button type="button" data-remove-index="${index}">移除</button>
    `
    container.appendChild(row)
  })
  if (items.length > 200) {
    const note = document.createElement('p')
    note.className = 'hint'
    note.textContent = `仅显示前 200 项，共 ${items.length} 项；完整内容请在 JSON 中编辑。`
    container.appendChild(note)
  }
}

const addItem = () => {
  if (!saveData) return
  const itemId = $('#itemId').value.trim()
  const quantity = Math.max(1, Math.floor(Number($('#itemQty').value || 1)))
  const quality = $('#itemQuality').value
  if (!itemId) {
    setStatus('请输入物品 ID。', 'error')
    return
  }
  const items = getInventory()
  const existing = items.find(item => item.itemId === itemId && item.quality === quality && !item.locked)
  if (existing) {
    existing.quantity = Math.max(0, Number(existing.quantity || 0)) + quantity
  } else {
    items.push({ itemId, quantity, quality })
  }
  jsonEditor.value = JSON.stringify(saveData, null, 2)
  refreshSummary()
  refreshInventory()
  setStatus(`已加入 ${itemId} x${quantity}。`, 'ok')
}

const addCatalogItem = itemId => {
  $('#itemId').value = itemId
  addItem()
  closeItemPicker()
}

const removeInventoryItem = index => {
  const items = getInventory()
  items.splice(index, 1)
  jsonEditor.value = JSON.stringify(saveData, null, 2)
  refreshSummary()
  refreshInventory()
  setStatus('已移除背包物品。', 'ok')
}

const initItemPicker = () => {
  const categorySelect = $('#itemCategory')
  const categories = Array.from(new Set(ITEM_CATALOG.map(item => item.category))).sort()
  categorySelect.innerHTML = [
    '<option value="">全部分类</option>',
    ...categories.map(category => `<option value="${escapeHtml(category)}">${escapeHtml(CATEGORY_NAMES[category] ?? category)}</option>`)
  ].join('')
  renderItemPicker()
}

const openItemPicker = () => {
  if (!saveData) return
  $('#itemPicker').hidden = false
  $('#itemSearch').focus()
  renderItemPicker()
}

const closeItemPicker = () => {
  $('#itemPicker').hidden = true
}

const normalizeSearchText = value =>
  String(value ?? '')
    .trim()
    .toLocaleLowerCase('zh-CN')

const getFilteredCatalog = () => {
  const keywords = normalizeSearchText($('#itemSearch').value)
    .split(/\s+/)
    .filter(Boolean)
  const category = $('#itemCategory').value
  return ITEM_CATALOG.filter(item => {
    if (category && item.category !== category) return false
    if (keywords.length === 0) return true
    const haystack = [
      item.id,
      item.name,
      item.category,
      CATEGORY_NAMES[item.category],
      item.description
    ]
      .map(normalizeSearchText)
      .join(' ')
    return keywords.every(keyword => haystack.includes(keyword))
  })
}

const renderItemPicker = () => {
  const list = $('#itemPickerList')
  const meta = $('#itemPickerMeta')
  if (!ITEM_CATALOG.length) {
    meta.textContent = '未找到物品目录。'
    list.innerHTML = ''
    return
  }
  const items = getFilteredCatalog()
  meta.textContent = `共 ${ITEM_CATALOG.length} 个物品，当前显示 ${items.length} 个。`
  const visibleItems = items.slice(0, 400)
  list.innerHTML = `
    <div class="picker-row header">
      <div>物品 ID</div>
      <div>游戏内名称</div>
      <div>分类</div>
      <div>售价</div>
      <div>操作</div>
    </div>
    ${visibleItems
      .map(
        item => `
          <div class="picker-row">
            <div class="mono">${escapeHtml(item.id)}</div>
            <div>${escapeHtml(item.name)}</div>
            <div>${escapeHtml(CATEGORY_NAMES[item.category] ?? item.category)}</div>
            <div>${Number(item.sellPrice ?? 0)}</div>
            <button type="button" data-pick-item="${escapeHtml(item.id)}">加入</button>
          </div>
        `
      )
      .join('')}
  `
  if (items.length > visibleItems.length) {
    const note = document.createElement('p')
    note.className = 'hint'
    note.style.padding = '0 10px 10px'
    note.textContent = `结果过多，仅显示前 ${visibleItems.length} 个；请继续输入关键词缩小范围。`
    list.appendChild(note)
  }
}

const exportEncryptedSave = () => {
  try {
    saveData = JSON.parse(jsonEditor.value)
    if ($('#updateSavedAt').checked) saveData.savedAt = new Date().toISOString()
    const encrypted = encryptSave(saveData)
    const base = sourceName.replace(/\.tyx$/i, '').replace(/\s+/g, '_')
    downloadText(`${base}_edited.tyx`, encrypted)
    setStatus('已导出加密 .tyx，可回游戏导入。', 'ok')
  } catch (error) {
    setStatus(`导出失败：${error.message}`, 'error')
  }
}

const exportPlainJson = () => {
  try {
    const data = JSON.parse(jsonEditor.value)
    const base = sourceName.replace(/\.tyx$/i, '').replace(/\s+/g, '_')
    downloadText(`${base}_decrypted.json`, JSON.stringify(data, null, 2), 'application/json')
    setStatus('已导出明文 JSON。', 'ok')
  } catch (error) {
    setStatus(`JSON 格式错误：${error.message}`, 'error')
  }
}

$('#saveFile').addEventListener('change', async event => {
  const file = event.target.files?.[0]
  if (!file) return
  sourceName = file.name
  try {
    const raw = await file.text()
    saveData = decryptSave(raw)
    refreshForm()
    setEnabled(true)
    setStatus(`已载入：${file.name}`, 'ok')
  } catch (error) {
    saveData = null
    jsonEditor.value = ''
    setEnabled(false)
    refreshSummary()
    refreshInventory()
    setStatus(error.message, 'error')
  }
})

$('#loadExample').addEventListener('click', () => {
  saveData = null
  sourceName = 'taoyuan-save.tyx'
  jsonEditor.value = ''
  $('#saveFile').value = ''
  setEnabled(false)
  refreshSummary()
  refreshInventory()
  setStatus('已清空当前内容。')
})

$('#applyForm').addEventListener('click', applyFormToData)
$('#applyJson').addEventListener('click', applyJsonToData)
$('#formatJson').addEventListener('click', () => {
  try {
    jsonEditor.value = JSON.stringify(JSON.parse(jsonEditor.value), null, 2)
    setStatus('JSON 已格式化。', 'ok')
  } catch (error) {
    setStatus(`JSON 格式错误：${error.message}`, 'error')
  }
})
$('#exportSave').addEventListener('click', exportEncryptedSave)
$('#exportJson').addEventListener('click', exportPlainJson)
$('#addItem').addEventListener('click', openItemPicker)
$('#addManualItem').addEventListener('click', addItem)
$('#inventoryList').addEventListener('click', event => {
  const button = event.target.closest('[data-remove-index]')
  if (!button) return
  removeInventoryItem(Number(button.dataset.removeIndex))
})
$('#itemSearch').addEventListener('input', renderItemPicker)
$('#itemCategory').addEventListener('change', renderItemPicker)
$('#itemPickerList').addEventListener('click', event => {
  const button = event.target.closest('[data-pick-item]')
  if (!button) return
  addCatalogItem(button.dataset.pickItem)
})
$('#itemPicker').addEventListener('click', event => {
  if (event.target.closest('[data-close-picker]')) closeItemPicker()
})
document.addEventListener('keydown', event => {
  if (event.key === 'Escape' && !$('#itemPicker').hidden) closeItemPicker()
})

initItemPicker()
setEnabled(false)
