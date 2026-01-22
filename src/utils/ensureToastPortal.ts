// Fügt beim App-Start ein Toast-Portal-Container-DIV in den Body ein, falls nicht vorhanden
export function ensureToastPortal() {
  if (typeof window === 'undefined') return;
  if (!document.getElementById('toast-portal')) {
    const portal = document.createElement('div');
    portal.id = 'toast-portal';
    portal.style.position = 'absolute';
    portal.style.left = '0';
    portal.style.width = '100%';
    portal.style.zIndex = '9999';
    document.body.appendChild(portal);
  }
}
