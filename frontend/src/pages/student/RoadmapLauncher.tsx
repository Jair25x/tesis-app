// src/pages/student/RoadmapLauncher.tsx
import { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { getActiveCurricula } from "../../services/curriculumService";
import LoadingScreen from "../../components/LoadingScreen";
import { showToast } from "../../utils/showToast";

export default function RoadmapLauncher() {
  const navigate = useNavigate();

  useEffect(() => {
    (async () => {
      try {
        const list = await getActiveCurricula();
        if (!list || list.length === 0) {
          showToast.info("No hay currículos activos.");
          return;
        }
        navigate(`/student/roadmap/${list[0].id}`, { replace: true });
      } catch (e) {
        console.error(e);
        showToast.error("No se pudo resolver el currículo activo.");
      }
    })();
  }, [navigate]);

  return <LoadingScreen />;
}
