<template>
    <nav
    :class="{
      'gui-tabs': true,
      'isHovering': isDragging && !hoverTab
    }"
    @dblclick.self="handleDblclick"
    @drop="handleDrop"
    @dragover.self="handleDragover($event, null)"
    @wheel="handleWheel"
  >
    <div
      v-for="tab of tabs"
      :id="tab.id"
      :key="tab.id"
      :class="{
        'gui-tabs-tab': true,
        'isActive': tab.id === activeTab.id,
        'isHovering': tab === hoverTab
      }"
      draggable="true"
      @mousedown.left="handleMousedown(tab)"
      @mousedown.middle="removeTab(tab, false)"
      @drag="handleDrag(tab)"
      @dragend="handleDragend"
      @dragover="handleDragover($event, tab)"
    >
      <span
        :class="{
          'gui-tabs-title': true,
          'isIgnore': isDragging
        }"
        :contenteditable="isEditing"
        @dblclick="handleTitleDblclick"
        @blur="handleTitleBlur($event, tab)"
        @paste="handleTitlePaste"
      >
        {{ tab.title }}
      </span>
      <svg
        :class="{
          'gui-tabs-close': true,
          'isIgnore': isDragging
        }"
        xmlns="http://www.w3.org/2000/svg"
        viewBox="0 0 512.001 512.001"
        @click="removeTab(tab)"
      >
        <path
          fill="#333"
          d="M284.286 256.002L506.143 34.144c7.811-7.811 7.811-20.475 0-28.285-7.811-7.81-20.475-7.811-28.285 0L256 227.717 34.143 5.859c-7.811-7.811-20.475-7.811-28.285 0-7.81 7.811-7.811 20.475 0 28.285l221.857 221.857L5.858 477.859c-7.811 7.811-7.811 20.475 0 28.285a19.938 19.938 0 0014.143 5.857 19.94 19.94 0 0014.143-5.857L256 284.287l221.857 221.857c3.905 3.905 9.024 5.857 14.143 5.857s10.237-1.952 14.143-5.857c7.811-7.811 7.811-20.475 0-28.285L284.286 256.002z"
        />
      </svg>
    </div>
  </nav>
</template>

<style>
.gui-tabs {
  background-color: #e9e9e9;
  height: 40px;
  overflow: hidden;
  overflow-x: overlay;
  white-space: nowrap;
}

.gui-tabs.isHovering {
  background-color: #e0e0e0;
}

.gui-tabs-tab {
  background-color: #e9e9e9;
  border-right: 1px solid #ccc;
  cursor: default;
  display: inline-block;
  padding: 0.75em 1em;
}

.gui-tabs-tab.isHovering {
  background-color: #d4e7fa;
}

.gui-tabs-tab.isActive {
  background-color: #fff;
}

.gui-tabs-close {
  margin-left: 8px;
  opacity: 0;
  transition: all ease 300ms;
  vertical-align: middle;
  width: 8px;
}

.gui-tabs-tab.isActive .gui-tabs-close,
.gui-tabs-tab:hover .gui-tabs-close {
  opacity: 0.5;
}

.gui-tabs-close:hover {
  opacity: 1 !important;
}

.gui-tabs::-webkit-scrollbar {
  background-color: #e7e7e7;
  display: none;
  opacity: 0.1;
  height: 3px;
}

.gui-tabs:hover::-webkit-scrollbar {
  display: block;
}

.gui-tabs::-webkit-scrollbar-thumb {
  background-color: #a8a8a8;
}

.gui-tabs-title {
  border: 1px dotted transparent;
  display: inline-block;
  outline: none;
}

.gui-tabs-title:focus {
  border-color: #333;
}

.gui-tabs-title.isIgnore,
.gui-tabs-close.isIgnore {
  pointer-events: none;
}
</style>

<script>
const WHEEL_SENSITIVITY = 0.5

export default {
  props: {
    l10n: {
      type: Object,
      default: () => ({
        newTab: 'New Tab',
        unnamed: 'Unnamed'
      })
    }
  },

  data: () => ({
    tabs: [],

    hoverTab: null,
    draggedTab: null,
    activeTab: null,

    isEditing: false,
    isDragging: false
  }),

  methods: {
    createTab (title, shouldBeActive = false) {
      const tab = {
        id: Math.random().toString(16).slice(2),
        title: title || this.l10n.newTab
      }
      this.tabs.push(tab)
      this.$emit('add', tab)
      if (shouldBeActive) {
        this.setActiveTab(tab)
      }
    },

    handleDblclick () {
      this.createTab(null, true)
    },

    setActiveTab (tab) {
      if (!tab) {
        return
      }
      this.activeTab = tab
      this.$emit('input', tab)
    },

    handleMousedown (tab) {
      this.setActiveTab(tab)
    },

    handleDrag (tab) {
      this.draggedTab = tab
      this.isDragging = true
    },

    handleDragover (e, tab) {
      this.hoverTab = tab
      e.dataTransfer.dropEffect = 'move'
      e.preventDefault()
    },

    handleDragend () {
      this.hoverTab = null
      this.isDragging = false
    },

    handleDrop () {
      const { draggedTab, hoverTab, tabs } = this
      const fromIndex = tabs.indexOf(draggedTab)
      const toIndex = tabs.indexOf(hoverTab)

      tabs.splice(fromIndex, 1)

      if (hoverTab === null) {
        tabs.push(draggedTab)
      } else if (toIndex === 0) {
        tabs.unshift(draggedTab)
      } else {
        tabs.splice(
          toIndex +
          (fromIndex > toIndex ? 1 : 0),
          0,
          draggedTab
        )
      }
    },

    handleWheel (e) {
      this.$el.scrollLeft += e.deltaY * WHEEL_SENSITIVITY
    },

    handleTitleDblclick (e) {
      this.isEditing = true
      this.$nextTick(() => e.target.focus())
    },

    handleTitleBlur (e, tab) {
      tab.title = e.target.textContent.trim() || this.l10n.unnamed
      this.isEditing = false
      e.target.textContent = tab.title
    },

    handleTitlePaste (e) {
      e.preventDefault()
    },

    setActiveById (id) {
      const tab = this.tabs.find((tab) => (
        tab.id === id
      ))
      if (tab) {
        this.setActiveTab(tab)
      }
    },

    setActiveByIndex (index) {
      if (!this.tabs.length) {
        this.setActiveTab(null)
      }
      this.setActiveTab(this.tabs[index] || this.tabs[0])
    },

    addTab (title, shouldBeActive = false) {
      this.createTab(title, shouldBeActive)
    },

    removeTab (tab, shouldSetActive = true) {
      this.$emit('remove', tab)
      const index = this.tabs.indexOf(tab)
      this.tabs.splice(index, 1)
      if (shouldSetActive) {
        this.setActiveByIndex(index)
      }
    }
  }
}
</script>
