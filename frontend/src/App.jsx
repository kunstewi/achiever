import React from 'react'
import Login from './pages/Auth/Login'
import SignUp from './pages/Auth/SignUp'
import Dashboard from './pages/User/Dashboard'
import ManageTasks from './pages/User/MyTasks'
import CreateTask from './pages/Admin/CreateTask'
import ManageUsers from './pages/Admin/ManageUsers'
import privateRoute from './routes/PrivateRoute'
import {
  BrowserRouter as Router,
  Routes,
  Route,
} from "react-router-dom"


const App = () => {
  return (
    <div>
      <Router>
        <Routes>
          <Route path="/login" element={<Login />} />
          <Route path="/signUp" element={<SignUp />} />

          {/* Admin Routes */}
          <Route element={<privateRoute allowdRoles={["admin"]} />}>
          
          <Route path="/admin/dashboard" element={<Dashboard />} />
          <Route path="/admin/tasks" element={<ManageTasks />} />
          <Route path="/admin/create-task" element={<CreateTask />} />
          <Route path="/admin/users" element={<ManageUsers />} />

          {/* Users Routes */}
          <Route>
            
          <Route path="/admin/dashboard" element={<Dashboard />} />
 
          </Route>
            
          </Route>
        </Routes>
      </Router>
    </div>
  )
}

export default App;