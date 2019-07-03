(() => {
  function getRoot() {
    if (!this.cachedRoot) {
      const rootEl = [...document.querySelectorAll('*')].find(e => e.__vue__)
      if (rootEl) {
        this.cachedRoot = rootEl.__vue__
      } else {
        throw new Error("Couldn't find Vue with exposed devtools")
      }
    }
    return this.cachedRoot
  }
  getRoot.cachedRoot = document.querySelector('#app') && document.querySelector('#app').__vue__

  // Traversing
  // ----------
  function getParents(e) {
    if (!e.$parent || !e.$parent.$vnode) return [e]
    return [e.$parent, ...getParents(e.$parent)]
  }

  function traverse(e, iterator = (e, parentResult) => e, parentResult = undefined) {
    const result = iterator(e, parentResult)

    const childResults = e.$children.flatMap(child => {
      return traverse(child, iterator, result)
    })
    return [result, ...childResults]
  }

  function traverseFiltered(root, filter, iterator) {
    return traverse(root, (e, parentResult) => {
      const keep = filter(e)
      const iteratorResult = keep ? iterator(e, parentResult) : undefined

      const depth = parentResult.depth + 1
      const depthFiltered = keep ? parentResult.depthFiltered + 1 : parentResult.depthFiltered
      return { iteratorResult, depth, depthFiltered }
    }, {depth: 0, depthFiltered: 0})
      .filter(({iteratorResult}) => iteratorResult !== undefined)
      .map(({iteratorResult}) => iteratorResult)
  }


  // Getters
  // -------
  function getName(e) {
    return e.$options.name || e.$options._componentTag
  }
  function getAttributes(e) {
    return {
      label: e.$attrs.label,
      model: e.$vnode.data.model && e.$vnode.data.model.expression,
    }
  }
  function doesSelectorMatch(e, selectorPart) {
    const eName = getName(e)
    const eAttributes = getAttributes(e)

    // selectorPart = 'ReactionDialog[model=isReactionDialogVisible][f=5]'
    const sName = selectorPart.match(/^[^\[]+/g)[0]
    const sAttributes = selectorPart.slice(sName.length).split(/[\[\]]/).filter(s=>s).map(pair => pair.split('='))

    return sName === eName &&
      sAttributes.every(([attrKey, attrValue]) => eAttributes[attrKey] === attrValue)
  }


  // Public
  // ------
  function vueTree(ignoreClutter) {
    let filterThroughClutter

    if (ignoreClutter) {
      const ignoreNames = new Set([
        // vue-router
        'RouterLink',
        'RouterView',

        // Vuetify
        'themeable',
        'theme-provider',
        'times',
        'toggleable',
        'touch',
        'transition-group',
        'transitionable',
        'translatable',
        'v-alert',
        'v-app',
        'v-autocomplete',
        'v-avatar',
        'v-badge',
        'v-bottom-nav',
        'v-bottom-sheet',
        'v-breadcrumbs',
        'v-breadcrumbs-divider',
        'v-breadcrumbs-item',
        'v-btn',
        'v-btn-toggle',
        'v-calendar',
        'v-calendar-daily',
        'v-calendar-monthly',
        'v-calendar-weekly',
        'v-card',
        'v-card-actions',
        'v-card-media',
        'v-card-text',
        'v-card-title',
        'v-carousel',
        'v-carousel-item',
        'v-checkbox',
        'v-chip',
        'v-combobox',
        'v-container',
        'v-content',
        'v-counter',
        'v-data-iterator',
        'v-data-table',
        'v-date-picker',
        'v-date-picker-date-table',
        'v-date-picker-header',
        'v-date-picker-month-table',
        'v-date-picker-title',
        'v-date-picker-years',
        'v-dialog',
        'v-divider',
        'v-edit-dialog',
        'v-expansion-panel',
        'v-expansion-panel-content',
        'v-flex',
        'v-footer',
        'v-form',
        'v-hover',
        'v-icon',
        'v-img',
        'v-input',
        'v-item',
        'v-item-group',
        'v-jumbotron',
        'v-label',
        'v-layout',
        'v-list',
        'v-list-group',
        'v-list-tile',
        'v-list-tile-action',
        'v-list-tile-action-text',
        'v-list-tile-avatar',
        'v-list-tile-content',
        'v-list-tile-sub-title',
        'v-list-tile-title',
        'v-menu',
        'v-messages',
        'v-navigation-drawer',
        'v-overflow-btn',
        'v-pagination',
        'v-parallax',
        'v-picker',
        'v-progress-circular',
        'v-progress-linear',
        'v-radio',
        'v-radio-group',
        'v-range-slider',
        'v-rating',
        'v-responsive',
        'v-select',
        'v-select-list',
        'v-sheet',
        'v-slider',
        'v-snack-transition',
        'v-snackbar',
        'v-spacer',
        'v-speed-dial',
        'v-stepper',
        'v-stepper-content',
        'v-stepper-header',
        'v-stepper-items',
        'v-stepper-step',
        'v-subheader',
        'v-switch',
        'v-system-bar',
        'v-tab',
        'v-tab-item',
        'v-table-overflow',
        'v-tabs',
        'v-tabs-items',
        'v-tabs-slider',
        'v-text-field',
        'v-textarea',
        'v-time-picker',
        'v-time-picker-clock',
        'v-time-picker-title',
        'v-timeline',
        'v-timeline-item',
        'v-toolbar',
        'v-toolbar-items',
        'v-toolbar-side-icon',
        'v-toolbar-title',
        'v-tooltip',
        'v-treeview',
        'v-treeview-node',
        'v-window',
        'v-window-item',
      ])
      filterThroughClutter = (e) => !ignoreNames.has(getName(e))
    } else {
      filterThroughClutter = (e) => true
    }

    return traverseFiltered(getRoot(),
      filterThroughClutter,
      (e, {depth, depthFiltered}) => {
        const attributes = Object.entries(getAttributes(e)).filter(([attrKey, attrValue]) => attrValue)

        return [
          '  '.repeat(depthFiltered),
          getName(e),
          ...attributes.map(([attrKey, attrValue]) => `[${attrKey}=${attrValue}]`),
        ].join('')
      }
    ).join('\n')
  }

  // vueFindAll('ReactionDialog[model=isReactionDialogVisible] MetaboliteDialog')
  function vueFindAll(selector = 'ComponentA[model=example] ComponentB') {
    const [elemSelector, ...parentsSelectors] = selector.split(/\s+/).reverse()

    const results = traverse(getRoot(), (e) => {
      const attributes = getAttributes(e)
      if (!doesSelectorMatch(e, elemSelector)) return undefined

      let parents = getParents(e)
      const parentsMatch = parentsSelectors.every((selector) => {
        const ix = parents.findIndex(p => doesSelectorMatch(p, selector))
        if (ix < 0) return undefined

        parents = parents.slice(ix)
        return true
      })

      if (!parentsMatch) return undefined
      return e
    }).filter(e => e !== undefined)

    if (results.length <= 0) {
      console.warn('No results for "' + selector + '".   Selectors tree: ', {
        get click_to_show() { console.log(vueTree(true)) },
        get click_to_show_cluttered() { console.log(vueTree(false)) },
      })
    }
    return results
  }

  function vueFind(selector) {
    const results = vueFindAll(selector)
    if (results.length > 1) console.warn('Multiple results for "' + selector + '".', { results: results })
    return results[0]
  }

  window.vueFind = vueFind
  window.vueFindAll = vueFindAll
})()
