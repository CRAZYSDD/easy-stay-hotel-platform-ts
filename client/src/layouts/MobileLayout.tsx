import { Outlet } from 'react-router-dom';
import ScrollToTop from '../components/common/ScrollToTop';
import styles from './MobileLayout.module.css';

export default function MobileLayout() {
  return (
    <div className={`page-shell ${styles.layout}`}>
      <div className={styles.phoneFrame} data-scroll-root>
        <ScrollToTop />
        <Outlet />
      </div>
    </div>
  );
}
