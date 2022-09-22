import { GAME_STATUS } from './constants.js'
import { getRandomColorPairs } from './utils.js'
import { PAIRS_COUNT, GAME_TIME } from './constants.js'
import {
  getColorElementList,
  getColorListElement,
  getGameStatusElement,
  getInActiveColorElementList,
  getPlayAgainButton,
  getColorBackground,
  getTimerElement,
} from './selectors.js'

// Global variables
let selections = []
let gameStatus = GAME_STATUS.PLAYING

// TODOs
// 1. Generating colors using https://github.com/davidmerfield/randomColor

function handleColorClick(colorElement) {
  const shouldBlockGame = [GAME_STATUS.BLOCKING, GAME_STATUS.FINISHED].includes(gameStatus)
  if (!colorElement || shouldBlockGame) return
  colorElement.classList.add('active')

  // Check win logic
  // save clicked cell to selections
  selections.push(colorElement)
  if (selections.length < 2) return

  // check Match
  const firstColor = selections[0].dataset.color
  const secondColor = selections[1].dataset.color
  const isMatch = firstColor === secondColor

  if (isMatch) {
    // check win
    const isWin = getInActiveColorElementList().length === 0

    // show background color same as current color
    const backgroundColorElement = getColorBackground()
    if (backgroundColorElement) backgroundColorElement.style.backgroundColor = firstColor

    // show replay button and show 'YOU WIN'
    if (isWin) {
      gameStatus = GAME_STATUS.FINISHED
      // show YOU WIN
      const gameStatusElement = getGameStatusElement()
      if (gameStatusElement) gameStatusElement.textContent = 'YOU WIN'

      // show replay button
      const replayButtonElement = getPlayAgainButton()
      if (replayButtonElement) replayButtonElement.classList.add('show')

      const timerElement = getTimerElement()
      timerElement.textContent = ''
    }

    selections = []
  } else {
    // set game status for current turn
    gameStatus = GAME_STATUS.BLOCKING

    setTimeout(() => {
      selections[0].classList.remove('active')
      selections[1].classList.remove('active')
      selections = []
      // reset game status for next turn after 500ms
      gameStatus = GAME_STATUS.PLAYING
    }, 500)
  }
}

function attachEventForLiElement() {
  // Attach item click for all li elements
  const ulElement = getColorListElement()
  if (ulElement) {
    ulElement.addEventListener('click', (event) => {
      // event delegation
      if (event.target.tagName !== 'LI') return
      handleColorClick(event.target)
    })
  }
}

function initColorElement() {
  const colorElementList = getColorElementList()

  // random 8 pairs of colors
  const colorList = getRandomColorPairs(PAIRS_COUNT)

  // set color for each li element from colorList
  for (let i = 0; i < colorList.length; i++) {
    colorElementList[i].dataset.color = colorList[i]

    const divElement = colorElementList[i].querySelector('.overlay')
    if (divElement) {
      divElement.style.backgroundColor = colorList[i]
    }
  }
}

function attachEventForReplayButton() {
  const replayButtonElement = getPlayAgainButton()
  if (replayButtonElement) {
    replayButtonElement.addEventListener('click', () => {
      // hidden color element
      const colorElementList = getColorElementList()
      for (const colorElement of colorElementList) {
        colorElement.classList.remove('active')
      }

      // hidden status YOU WIN
      const gameStatusElement = getGameStatusElement()
      if (gameStatusElement) gameStatusElement.textContent = ''

      // hidden replay button
      const replayButtonElement = getPlayAgainButton()
      if (replayButtonElement) replayButtonElement.classList.remove('show')

      // reset init color
      initColorElement()

      // reset count down timer
      initCountDownTimer(GAME_TIME)

      // set game status for next game
      gameStatus = GAME_STATUS.PLAYING
    })
  }
}

function initCountDownTimer(time) {
  const timerElement = getTimerElement()
  const gameStatusElement = getGameStatusElement()
  const replayButtonElement = getPlayAgainButton()
  timerElement.textContent = time
  let count = time - 1

  let countDown = setInterval(function () {
    timerElement.textContent = count
    count--

    if (GAME_STATUS.FINISHED.includes(gameStatus)) {
      clearInterval(countDown)
      timerElement.textContent = ''
    }

    if (count < 0) {
      clearInterval(countDown)
      // show status GAME OVER + show replay button
      gameStatusElement.textContent = 'GAME OVER'
      timerElement.textContent = ''
      replayButtonElement.classList.add('show')
      gameStatus = GAME_STATUS.BLOCKING
    }
  }, 1000)
}

// 4. Add timer
// 5. Handle replay click
;(() => {
  initColorElement()
  attachEventForLiElement()
  attachEventForReplayButton()
  initCountDownTimer(GAME_TIME)
})()
