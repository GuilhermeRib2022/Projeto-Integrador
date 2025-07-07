import { BASE_URL } from "../../components/url";
import { Link, Navigate, useNavigate } from "react-router-dom";
import styles from './videoSection.module.css';
import hexToRGBA from '../../services/hexToRgba';


const VideoSection = ({ title, videos }) => {
  const navigate = useNavigate();

  function getContrastingTextColor(hex) {
    // Remove "#" if present
    const color = hex.replace('#', '');

    // Parse r, g, b values
    const r = parseInt(color.substr(0, 2), 16);
    const g = parseInt(color.substr(2, 2), 16);
    const b = parseInt(color.substr(4, 2), 16);

    // Calculate luminance (simple brightness formula)
    const brightness = (r * 299 + g * 587 + b * 114) / 1000;

    // Return black for light backgrounds, white for dark ones
    return brightness > 128 ? '#000000' : '#FFFFFF';
  }

  return(
  <>
  <br></br>
    <h2>{title}</h2>
    <br></br>
    <div className={styles.videoList}>
      {videos.map((video, index) => (
        <div className={styles.videoCard} key={index}>
          <div className={styles.videoHeader} style={{ backgroundColor: hexToRGBA(video.Cor || '#d0e3ff', 0.85)  }}>
            <span style={{color: getContrastingTextColor(video.Cor), cursor: 'pointer'}} className={styles.disciplina} onClick={() => navigate(`/pesquisar/disciplina?disciplina=${encodeURIComponent(video.Disciplina)}`)}><strong>{video.Disciplina}</strong></span>
            <span style={{color: getContrastingTextColor(video.Cor)}} className={styles.rating}>⭐ {Math.round(parseFloat(video.Nota) * 10)}%</span>
          </div>
          <div className={styles.videoThumbnail}>
            <img
              src={`${BASE_URL}/uploads/thumbnails/${video.Thumbnail}`} 
              alt="thumbnail"
              onClick={() => navigate(`/video/${video.ID}`)}
              onError={(e) => { e.target.src = '/placeholder.png'; }}
            />
            <span className={styles.duration}>{formatDuration(video.Duracao)}</span>
          </div>
          <div className={styles.videoInfo}>
            <Link to={`/video/${video.ID}`}><h4 className={styles.title}>{video.Titulo}</h4></Link>
            <p className={styles.meta}>
              {formatViews(video.Views)} visualizações • {formatDate(video.DataPublicacao)}
            </p>
          </div>
        </div>
      ))}
    </div>
  </>
  )
};



const formatViews = (n) => n.toLocaleString('pt-PT');
const formatDate = (dateStr) => {
  const date = new Date(dateStr);
  return isNaN(date) ? 'Data inválida' : date.toLocaleDateString('pt-PT');
};
const formatDuration = (seconds) => {
  if (!seconds || isNaN(seconds)) return '0:00';
  const min = Math.floor(seconds / 60);
  const sec = seconds % 60;
  return `${min}:${sec.toString().padStart(2, '0')}`;
};

export default VideoSection;
