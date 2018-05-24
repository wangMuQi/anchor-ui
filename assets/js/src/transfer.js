const xdhelper = require('xdhelper')

/**
 * transfer
 */

const Transfer = (($) => {

  /**
   * Constants
   */

  const NAME = 'transfer'
  const VERSION = '1.0.0-beta'
  const DATA_KEY = 'anchor.transfer'
  const EVENT_KEY = `.${DATA_KEY}`
  const DATA_API_KEY = '.data-api'
  const JQUERY_NO_CONFLICT = $.fn[NAME]

  const Default = {
    clickDeselect: true,
    selectWidth: 280,
    liveSearch: false,
  }

  const Event = {
    LOAD_DATA_API: `load${EVENT_KEY}${DATA_API_KEY}`,
    CLICK_DATA_API: `click${EVENT_KEY}${DATA_API_KEY}`
  }

  const Selector = {
    DATA_TRANSFER: '[data-toggle="transfer"]',
    BLOCK_LEFT: '.transfer-left',
    BLOCK_RIGHT: '.transfer-right',
    TRANSFER_WRAPPER: '.transfer-wrapper',
    TRANSFER_TO_RIGHT: '.transfer-to-right',
    TRANSFER_TO_LEFT: '.transfer-to-left',
    SORT_UP: '.sort-up',
    SORT_DOWN: '.sort-down'
  }

  const Template = (id, options) => {
    let templates = {
      LEFT_BUTTONS: `<div class="transfer-btns">
        <button class="${options.className.right} btn btn-default-light" type="button">
          <span class="glyphicon glyphicon-menu-right"></span>
        </button>
        <button class="${options.className.left} btn btn-default-light" type="button">
          <span class="glyphicon glyphicon-menu-left"></span>
        </button>
      </div>`,
      RIGHT_BUTTONS: `<div class="transfer-btns">
        <button class="${options.className.up} btn btn-default-light" type="button">
          <span class="glyphicon glyphicon-menu-up"></span>
        </button>
        <button class="${options.className.down} btn btn-default-light" type="button">
          <span class="glyphicon glyphicon-menu-down"></span>
        </button>
      </div>`
    }
    return templates[id]
  }

  /**
   * Class Definition
   */

  class Transfer {
    constructor (root, config) {
      this._config = this._getConfig(config)

      this.$root = $(root)
      this.$block = {}
      this.$block.left = this.$root.find(Selector.BLOCK_LEFT)
      this.$block.right = this.$root.find(Selector.BLOCK_RIGHT)
      this.$select = {}
      this.$select.left = this.$block.left.find('select')
      this.$select.right = this.$block.right.find('select')
      this.selectOptions = {
        left: null,
        right: null
      }

      this.deselectLock = false

      this.init()
    }

    // getters

    static get VERSION () {
      return VERSION
    }

    static get Default () {
      return Default
    }

    // public

    init () {
      this.$root.addClass(Transfer._getNameFromClass(Selector.TRANSFER_WRAPPER))

      this.selectOptions.left = this.$root.find('.transfer-left select').html()
      this.selectOptions.right = this.$root.find('.transfer-right select').html()

      this.$block.left.append(Template('LEFT_BUTTONS', {
        className: {
          right: Transfer._getNameFromClass(Selector.TRANSFER_TO_RIGHT),
          left: Transfer._getNameFromClass(Selector.TRANSFER_TO_LEFT)
        }
      }))

      this.$block.right.append(Template('RIGHT_BUTTONS', {
        className: {
          up: Transfer._getNameFromClass(Selector.SORT_UP),
          down: Transfer._getNameFromClass(Selector.SORT_DOWN)
        }
      }))

      if (this._config.liveSearch) {
        this.$select.left.addClass('select-left').attr({
          'data-live-search': true,
          'data-none-results-text': '没有找到匹配 {0}',
        })
      }

      this.$select.left.add(this.$select.right).each((i, el) => {
        $(el)
          .addClass('selectpicker')
          .attr({'data-width': `${this._config.selectWidth}px`})

        let maxOptions = $(el).data('maxOptions')

        if (maxOptions) {
          $(el).attr('data-max-options-text', `最多选择${maxOptions}项`)
        }

        $(el).on('changed.bs.select', (event) => {
          if (this.deselectLock) return
          this.deselectLock = true

          let oppositeDirection
          if ($(event.target).closest(Selector.BLOCK_LEFT).length) oppositeDirection = 'right'
          else if ($(event.target).closest(Selector.BLOCK_RIGHT).length) oppositeDirection = 'left'

          this.$select[oppositeDirection].selectpicker('deselectAll')
          this._refreshSelect()

          setTimeout(() => {
            this.deselectLock = false
          }, 0)
        })
      })

      $(document).on('click', (event) => {
        if ($(event.target).closest('.transfer-btns').length) return
        if (this._config.clickDeselect) {
          setTimeout(() => {
            this.deselectAll()
          }, 100)
        }
      })

      this._refreshSelect()

      if (!$('<div>').append(this.$root.clone()).find(Selector.DATA_TRANSFER).length) {
        this.$root.attr('data-toggle', 'transfer')
      }

      this.$root.addClass('transfer-component-inited')
    }

    transferItems (element, direction) {
      let directionSideMap = {
        right: {from: 'left', to: 'right'},
        left: {from: 'right', to: 'left'},
        up: {from: 'right', to: 'right'},
        down: {from: 'right', to: 'right'},
      }
      let $selectFrom = this.$select[directionSideMap[direction].from]
      let $selectTo = this.$select[directionSideMap[direction].to]
      let $selectItems = $selectFrom.find('option:selected')

      switch (direction) {
        case 'right':
        case 'left':
          $selectTo.append($selectItems)
          break

        case 'up':
          $selectItems.each((i, el) => {
            let len = $selectTo.find('option').length
            let index = $(el).index()

            if (index) {
              let $prevOption = $selectTo.find('option').eq(index - 1)
              if (!$prevOption.is(':selected')) {
                $prevOption.before($(el))
              }
            }
          })
          break

        case 'down':
          $selectItems = $selectItems.reverse()
          $selectItems.each((i, el) => {
            let len = $selectTo.find('option').length
            let index = $(el).index()

            if (index < len - 1) {
              let $nextOption = $selectTo.find('option').eq(index + 1)
              if (!$nextOption.is(':selected')) {
                $nextOption.after($(el))
              }
            }
          })
          break
      }

      let $scrollMenu = this.$root.find('.transfer-right .dropdown-menu.inner')
      let currentScrollPosition = $scrollMenu.scrollTop()
      let selectedItemsIndex = []

      $selectItems.each((i, el) => {
        let index = $(el).index()
        selectedItemsIndex.push(index)
      })

      switch (direction) {
        case 'up':
          {
            let firstIndex = xdhelper.getArrLeastItem(selectedItemsIndex)
            let shouldScrollPosition = firstIndex * 28

            if (currentScrollPosition > shouldScrollPosition) $scrollMenu.scrollTop(shouldScrollPosition)
          }
          break

        case 'down':
          {
            let lastIndex = xdhelper.getArrGreatestItem(selectedItemsIndex)
            let shouldScrollPosition = lastIndex * 28 - 12 * 28 + 28

            if (shouldScrollPosition < 0) shouldScrollPosition = 0
            if (currentScrollPosition < shouldScrollPosition) $scrollMenu.scrollTop(shouldScrollPosition)
          }
          break
      }

      this._refreshSelect()
    }

    val () {
      let val = []

      this.$select.right.find('option').each((i, el) => {
        val.push($(el).attr('value'))
      })

      return val
    }

    fullVal () {
      let val = []

      this.$select.right.find('option').each((i, el) => {
        val.push({
          value: $(el).attr('value'),
          text: $(el).text()
        })
      })

      return val
    }

    deselectAll () {
      this.$select.left.add(this.$select.right).selectpicker('deselectAll')
    }

    reset () {
      this.$root.find('.transfer-left select').html(this.selectOptions.left)
      this.$root.find('.transfer-right select').html(this.selectOptions.right)

      this._refreshSelect()
    }

    // private

    _getConfig (config) {
      config = $.extend({}, Default, config)

      return config
    }

    _refreshSelect () {
      this.$select.left.add(this.$select.right).selectpicker('refresh')
    }

    // static

    static _getNameFromClass (className) {
      className = className.replace(/\./g, '')

      return className
    }

    static _jQueryInterface (config) {
      let funcResult

      let defaultResult = this.each((i, el) => {
        let data = $(el).data(DATA_KEY)
        let _config = $.extend(
          {},
          Transfer.Default,
          $(el).data(),
          typeof config === 'object' && config
        )

        if (!data) {
          data = new Transfer(el, _config)
          $(el).data(DATA_KEY, data)
        }

        if (typeof config === 'string') {
          if (typeof data[config] === 'undefined') {
            throw new Error(`No method named "${config}"`)
          }
          funcResult = data[config]()
        }
      })

      return funcResult === undefined ? defaultResult : funcResult
    }

    static _transferBtnClickHandler (event) {
      let target = $(event.target).closest(Selector.DATA_TRANSFER)[0]
      if (!$(target).length) return

      let config = $.extend({}, $(target).data())
      Transfer._jQueryInterface.call($(target), config)

      $(target).data(DATA_KEY).transferItems(event.target, event.data.direction)
    }
  }

  /**
   * Data Api
   */

  $(document)
    .on(Event.CLICK_DATA_API, Selector.TRANSFER_TO_RIGHT, {direction: 'right'}, Transfer._transferBtnClickHandler)
    .on(Event.CLICK_DATA_API, Selector.TRANSFER_TO_LEFT, {direction: 'left'}, Transfer._transferBtnClickHandler)
    .on(Event.CLICK_DATA_API, Selector.SORT_UP, {direction: 'up'}, Transfer._transferBtnClickHandler)
    .on(Event.CLICK_DATA_API, Selector.SORT_DOWN, {direction: 'down'}, Transfer._transferBtnClickHandler)

  $(document).ready(() => {
    $(Selector.DATA_TRANSFER).each((i, el) => {
      let $transfer = $(el)

      Transfer._jQueryInterface.call($transfer, $transfer.data())
    })
  })

  /**
   * jQuery
   */

  $.fn[NAME] = Transfer._jQueryInterface
  $.fn[NAME].Constructor = Transfer
  $.fn[NAME].noConflict = () => {
    $.fn[NAME] = JQUERY_NO_CONFLICT
    return Transfer._jQueryInterface
  }

  return Transfer

})(jQuery)
