import { createRouter, createWebHistory } from 'vue-router'
import HomeView    from '../views/HomeView.vue'
import EditorView  from '../views/EditorView.vue'

const routes = [
  { path: '/',            component: HomeView,   name: 'home' },
  { path: '/editor/:id',  component: EditorView, name: 'editor' },
]

export default createRouter({
  history: createWebHistory(),
  routes,
})
