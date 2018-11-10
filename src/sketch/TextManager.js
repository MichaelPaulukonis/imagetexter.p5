export default class TextManager {
  constructor (text) {
    var defaultText = 'These are the pearls that were his eyes'
    var SPLIT_TOKENS = '[ ?.,;:<>()"]'
    var charIndex = 0
    var wordIndex = 0
    let self = this
    self.words = []
    self.getchar = function () {
      var c = self.w.charAt(charIndex)
      charIndex = (charIndex + 1) % self.w.length
      return c
    }
    self.getcharRandom = function () {
      return self.w.charAt(Math.floor(Math.random() * self.w.length))
    }
    self.getWord = function () {
      var word = self.words[wordIndex]
      wordIndex = (wordIndex + 1) % self.words.length
      return word
    }
    self.getText = function () {
      return self.w
    }
    self.setText = function (text) {
      self.w = text
      self.words = self.w.split(new RegExp(SPLIT_TOKENS, 'g'))
      wordIndex = 0
      charIndex = 0
    }

    self.setText(text || defaultText)
  }
}
