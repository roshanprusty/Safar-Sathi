import React from 'react'
import Header from './../Header/Header'
import Routers from '../../router/Routers'
import Footer from './../Footer/Footer'
import { ChatProvider } from '../Chatbot/chatProvider'
import ChatWidget from '../Chatbot/ChatWidget'

const Layout = () => {
   return (
      <ChatProvider>
         <Header />
         <Routers />
         <Footer />
         <ChatWidget />
      </ChatProvider>
   )
}

export default Layout