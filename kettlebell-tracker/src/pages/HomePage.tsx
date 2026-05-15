import { useNavigate } from 'react-router-dom';
import CallingCard from '../components/home/CallingCard';
import { NEXT_PIDYOM_SESSION } from '../data/pidyomSessions';

// Home — the calling card. Only the wordmark + coords + time live here.
// Everything else (focus, RSVP, roster, coach note) lives one tap deeper
// on the Dossier.
//
// Tabbar suppression for "/" is handled by RootLayout.
//
// LetterScrambleReveal transition is wired in C5 + S1; for now the tap
// performs an instant route change to the dossier.
export default function HomePage() {
  const navigate = useNavigate();
  const session = NEXT_PIDYOM_SESSION;

  const handleTap = () => {
    if (session) navigate(`/dossier/${session.id}`);
  };

  return <CallingCard session={session} onTap={handleTap} />;
}
