import { Routes, Route } from "react-router-dom";
import Home from "./pages/Home";
import ChatPage from "./pages/Chat";
import WaitList from "./pages/waitlists/WaitList";
import Location from "./pages/waitlists/Location";
import WaitListSuccess from "./pages/waitlists/Success";
import AdminHome from "./pages/admin";



function App() {
  return (
    <>
      {/* <header>
        <SignedOut>
          <SignInButton>
            Sign in with Clerk
          </SignInButton>
        </SignedOut>
        <SignedIn>
          <UserButton />
        </SignedIn>
      </header> */}
      <Routes>
        {/* <Route path="/" element={<Home />} />
        <Route path="/s/:id" element={<ChatPage />} /> */}
        <Route path="/" element={<WaitList />} /> 
        <Route path="/admin" element={<AdminHome />} /> 
        <Route path="/pending" element={<Location />} /> 
        <Route path="/success" element={<WaitListSuccess />} />
      </Routes>
    </>
  );
}

export default App;
