import _public from './_public'

$(document).ready(function () {
  $('[data-toggle="tooltip"]').tooltip()
  $('[data-toggle="popover"]').popover()

  console.log('ANCHOR_VERSION: ' + $.ANCHOR_VERSION)

  _public.fixedNavSidebar()
  _public.smoothScroll()

  /* 过滤器组件 */
  {
    $('#toggleTableFilter').on('click', function () {
      $('#basicTableFilter').tablefilter('toggle')
    })

    $('#basicTableFilter').on('search.anchor.tablefilter', function (event, data) {
      console.log('过滤器条件语句', data.query)
    })
  }

  /* 表格组件 */
  {
    $('#basicTable').on('filter.changed.anchor.table', function (event, data) {
      console.log('字段更新', data.data)
    })

    $('#basicTableOpt a').on('click', function (event) {
      event.preventDefault()
      var value = $(this).data('opt')
      var selected = $('#basicTable').table('selected')
      console.log('操作按钮', value, selected)
    })
  }

  {
    $('#sortable-demo-1').sortable({
      group: {
        name: 'sortable-name-1',
        pull: false,
        put: false,
      },
      sort: true,
      animation: 100,
      ghostClass: 'anchor-sortable-ghost',
      chosenClass: 'anchor-chosen-ghost',
    })
  }

  {
    $('#sortable-demo-2').sortable({
      group: {
        name: 'sortable-name-2',
        pull: false,
        put: false,
      },
      sort: true,
      animation: 100,
      ghostClass: 'anchor-sortable-ghost',
      chosenClass: 'anchor-chosen-ghost',
    })
  }
  {
    $('#sortable-demo-3').sortable({
      group: {
        name: 'sortable-name-3',
        pull: true,
        put: ['sortable-name-4'],
      },
      sort: true,
      animation: 100,
      ghostClass: 'anchor-sortable-ghost',
      chosenClass: 'anchor-chosen-ghost',
    })
  }
  {
    $('#sortable-demo-4').sortable({
      group: {
        name: 'sortable-name-4',
        pull: true,
        put: ['sortable-name-3'],
      },
      sort: true,
      animation: 100,
      ghostClass: 'anchor-sortable-ghost',
      chosenClass: 'anchor-chosen-ghost',
    })
  }
})
