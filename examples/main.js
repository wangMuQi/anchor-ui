import { Header, Footer } from './template'
import { Main } from './template/pages/home'
import index from './js/src/index'

document.getElementById('header').innerHTML = Header()
document.getElementById('footer').innerHTML = Footer()
document.getElementById('main').innerHTML = Main()