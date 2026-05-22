import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { PlayerProvider, usePlayer } from './context/PlayerContext';
import Register from './components/Register';
import ClassSelect from './components/ClassSelect';
import Welcome from './components/Welcome';
import Lobby from './components/hub/Lobby';

function ProtectedLobby() {
  const { player } = usePlayer();
  if (!player) return <Navigate to="/register" replace />;
  if (!player.combat_class) return <Navigate to="/class-select" replace />;
  return <Lobby />;
}

function GuestOnly({ element }: { element: JSX.Element }) {
  const { player } = usePlayer();
  if (player?.combat_class) return <Navigate to="/" replace />;
  return element;
}

function ClassGuard() {
  const { player } = usePlayer();
  if (!player) return <Navigate to="/register" replace />;
  if (player.combat_class) return <Navigate to="/" replace />;
  return <ClassSelect />;
}

function WelcomeGuard() {
  const { player } = usePlayer();
  if (!player) return <Navigate to="/register" replace />;
  if (!player.combat_class) return <Navigate to="/class-select" replace />;
  return <Welcome />;
}

export default function App() {
  return (
    <BrowserRouter>
      <PlayerProvider>
        <Routes>
          <Route path="/"             element={<ProtectedLobby />} />
          <Route path="/register"     element={<GuestOnly element={<Register />} />} />
          <Route path="/class-select" element={<ClassGuard />} />
          <Route path="/welcome"      element={<WelcomeGuard />} />
        </Routes>
      </PlayerProvider>
    </BrowserRouter>
  );
}
