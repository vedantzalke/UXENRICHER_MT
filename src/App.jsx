import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import { useSelector } from "react-redux";
import SocketListner from "./components/SocketListner";
import { ToastContainer } from "react-toastify";
import Home from "./pages/Home";
import Login from "./pages/Login";
import Signup from "./pages/Signup";
import Posts from "./pages/Posts"; // Renamed from Issues.jsx
import Profile from "./pages/Profile";
import Analysis from "./pages/Analysis";
import PrivateRoute from "./components/PrivateRoute";
import ErrorBoundary from "./components/ErrorBoundary";
import Navbar from "./components/Navbar";
import Footer from "./components/Footer";
import NotFound from "./pages/NotFound";
import Notifications from "./components/Notifications";
import AdminDashboard from "./pages/AdminDashboard";
import OthersProfile from "./pages/OthersProfile";
import ProfileEditModal from "./components/ProfileEditModal";
import Leaderboard from "./pages/LeaderBoard";
import { ModalProvider } from "./components/ModalContext";
import About from "./pages/About";
const App = () => {
  const { loading } = useSelector((state) => state.global);
  return (
    <Router>
        <SocketListner />
        <ModalProvider>
      <ErrorBoundary>
        {loading && <div className="loading-overlay">Loading...</div>}
        <Navbar />
          <ToastContainer position="top-right" autoClose={1800} />
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/login" element={<Login />} />
          <Route path="/signup" element={<Signup />} />
          <Route path="/about" element={<About />} />
          <Route element={<PrivateRoute />}>
            <Route path="/allPosts" element={<Posts />} />  {/* Renamed route */}
            <Route path="/analysis" element={<Analysis />} />
            <Route path="/leaderboard" element={<Leaderboard />} />
            <Route path="/me" element={<Profile />} />
            <Route path="/users/:userId" element={<OthersProfile />} />
            <Route path="/notifications" element={<Notifications />} />
            <Route path="/admin-dashboard" element={<AdminDashboard />} />
          </Route>
          <Route path="*" element={<NotFound />} />
        </Routes>
        <Footer />
      </ErrorBoundary>
      </ModalProvider>
    </Router>
  );
};

export default App;
