/* =====================================
   CONFIGURACIÓN GLOBAL (GITHUB + APPS SCRIPT)
===================================== */
const CONFIG = {
    API_URL: 'https://script.google.com/macros/s/AKfycbyYIGMurL7kfP1c5PDiMOWYVsKs3sFuX2W89AYTrz3_L5KvXFcgIIPLCttjHefCINSKWg/exec',
    DEBUG: true
  };
  
  /* =====================================
     CREAR URL PARA GET
  ===================================== */
  function buildURL(sheet, action, data = null) {
    let url = `${CONFIG.API_URL}?sheet=${sheet}&action=${action}`;
  
    if (data) {
      url += `&data=${encodeURIComponent(JSON.stringify(data))}`;
    }
  
    return url;
  }
  
  /* =====================================
     GET (CONSULTAS)
  ===================================== */
  async function apiGet(sheet, action, data = null) {
    try {
      const url = buildURL(sheet, action, data);
  
      const resp = await fetch(url);
      if (!resp.ok) throw new Error('Error en la API');
  
      const result = await resp.json();
  
      if (CONFIG.DEBUG) {
        console.log('GET:', { sheet, action, result });
      }
  
      return result;
  
    } catch (error) {
      console.error('GET ERROR:', error);
      return [];
    }
  }
  
  /* =====================================
     POST (INSERTAR DATOS)
  ===================================== */
  async function apiPost(sheet, action, data) {
    try {
      const resp = await fetch(`${CONFIG.API_URL}?sheet=${sheet}&action=${action}`, {
        method: 'POST',
        body: new URLSearchParams({
          data: JSON.stringify(data)
        })
      });
  
      if (!resp.ok) throw new Error('Error en la API');
  
      const result = await resp.json();
  
      if (CONFIG.DEBUG) {
        console.log('POST:', { sheet, action, result });
      }
  
      return result;
  
    } catch (error) {
      console.error('POST ERROR:', error);
      return null;
    }
  }