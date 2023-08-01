import { useState } from 'react'
import reactLogo from './assets/react.svg'
import viteLogo from '/vite.svg'
import './App.css'
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import Home from './pages/Home';
import EditorPage from './pages/EditorPage';
import { Toaster } from 'react-hot-toast';

function App() {
  const [count, setCount] = useState(0)

  return (
    <>
      <div>
        <Toaster 
          position='top-right'
          toastOptions={{
            success: {
              duration: 3000,
              iconTheme: {
                primary: '#4aed88'
              }
            }
          }}
        ></Toaster>
      </div>
      <BrowserRouter>
        <Routes>
          <Route path='/' element={<Home />}></Route>
          <Route path='/editor/:roomId' element={<EditorPage />}></Route>
        </Routes>
      </BrowserRouter>
    </>
  )
}

export default App
