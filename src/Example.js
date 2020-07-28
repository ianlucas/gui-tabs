import Vue from 'vue'
import GuiTabs from './GuiTabs.vue'

new Vue({
  render: (h) => (
    h(GuiTabs, {
      props: {
        dblCreate: false
      }
    })
  )
}).$mount('#app')
