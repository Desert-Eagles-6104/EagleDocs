import React, {useEffect, useState} from 'react';

const setupChecklistItems = [
  {id: 'wpilib', label: 'פתחתי את WPILib VS Code 2026.'},
  {id: 'java', label: 'בדקתי ש־Java זמינה, או השלמתי את ההגדרה לפי ההוראות.'},
];

export default function SetupChecklist({children}) {
  const storageKey = 'eagledocs:setup-checklist:wpilib-2026:v1';
  const [checked, setChecked] = useState({});
  const [ready, setReady] = useState(false);
  const [canSave, setCanSave] = useState(true);
  useEffect(() => {
    try {
      const raw = window.localStorage.getItem(storageKey);
      let saved = {};
      if (raw) {
        try {
          const parsed = JSON.parse(raw);
          if (parsed && typeof parsed === 'object' && !Array.isArray(parsed)) {
            saved = Object.fromEntries(setupChecklistItems.map(({id}) => [id, parsed[id] === true]));
          }
        } catch {
          saved = {};
        }
      }
      setChecked(saved);
    } catch {
      setCanSave(false);
    }
    setReady(true);
  }, []);
  useEffect(() => {
    if (!ready) return;
    try {
      window.localStorage.setItem(storageKey, JSON.stringify(checked));
      setCanSave(true);
    } catch {
      setCanSave(false);
    }
  }, [checked, ready]);
  const completedCount = setupChecklistItems.filter(({id}) => checked[id] === true).length;
  const allComplete = ready && completedCount === setupChecklistItems.length;
  return (
    <div>
      <fieldset style={{border: '1px solid var(--ifm-color-emphasis-300)', borderRadius: '8px', padding: '1rem'}}>
        <legend style={{width: 'auto', fontSize: '1rem', padding: '0 0.5rem'}}>רשימת הבדיקה שלי</legend>
        {setupChecklistItems.map(({id, label}) => (
          <label key={id} style={{display: 'flex', alignItems: 'flex-start', gap: '0.65rem', padding: '0.6rem 0', cursor: ready ? 'pointer' : 'default'}}>
            <input
              type="checkbox"
              checked={checked[id] === true}
              disabled={!ready}
              onChange={(event) => {
                const value = event.target.checked;
                setChecked((previous) => ({...previous, [id]: value}));
              }}
              style={{marginTop: '0.3rem', flexShrink: 0, width: '1.1rem', height: '1.1rem', accentColor: 'var(--ifm-color-primary)'}}
            />
            <span>{label}</span>
          </label>
        ))}
      </fieldset>
      <p role="status" style={{marginTop: '0.75rem'}}>
        {ready ? `הושלמו ${completedCount} מתוך ${setupChecklistItems.length} סעיפים.` : 'טוענים את הסימונים שלכם…'}
      </p>
      {ready && !canSave && <p>אפשר לסמן את הסעיפים, אבל הדפדפן לא מאפשר לשמור אותם לאחר עזיבת הדף.</p>}
      {allComplete ? (
        <div>
          <p><strong>סיימתם להכין את המחשב! עכשיו אפשר ליצור את התוכנית הראשונה.</strong></p>
          {children}
        </div>
      ) : (
        <p>אחרי שתסמנו את כל הסעיפים, יופיע כאן הקישור ליצירת הפרויקט הראשון.</p>
      )}
      {ready && completedCount > 0 && (
        <button type="button" className="button button--secondary button--sm" onClick={() => setChecked({})}>
          ניקוי הסימונים
        </button>
      )}
    </div>
  );
}
