import { useState } from "react";

type ExtractedData = {
  vendor: string; amount: string; date: string;
  ninea: string; description: string; tva: string;
};

export function OcrPage() {
  const [step, setStep] = useState<"upload"|"processing"|"result"|"confirm">("upload");
  const [extracted, setExtracted] = useState<ExtractedData | null>(null);
  const [editData, setEditData] = useState<ExtractedData | null>(null);
  const [dragOver, setDragOver] = useState(false);

  const DEMOS: ExtractedData[] = [
    { vendor: "SENELEC", amount: "2 847 500", date: "2026-04-15", ninea: "001001234-2026-A-1", description: "Facture electricite bureaux DAF - Avril 2026", tva: "427 125" },
    { vendor: "SONATEL", amount: "1 250 000", date: "2026-04-28", ninea: "001009012-2026-B-2", description: "Abonnement telephonie fixe et mobile - Avril 2026", tva: "187 500" },
    { vendor: "Total Energies", amount: "890 000", date: "2026-04-30", ninea: "001004567-2026-A-1", description: "Carburant vehicules officiels - Avril 2026", tva: "133 500" },
  ];

  function handleFile() {
    setStep("processing");
    setTimeout(() => {
      const demo = DEMOS[Math.floor(Math.random() * DEMOS.length)];
      setExtracted(demo);
      setEditData({...demo});
      setStep("result");
    }, 2500);
  }

  function confirm() { setStep("confirm"); }

  const inp = {
    width: "100%", padding: "8px 12px", borderRadius: 8,
    border: "1px solid var(--bn-border)", fontSize: 13,
    color: "var(--bn-text)", background: "var(--bn-bg)"
  };

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 20 }}>
      <div>
        <h1 style={{ fontSize: 22, fontWeight: 700, color: "var(--bn-text)", margin: 0 }}>Import OCR - Factures et Documents</h1>
        <p style={{ fontSize: 13, color: "var(--bn-muted)", marginTop: 4 }}>Importez une facture - extraction automatique par OCR en 2 secondes</p>
      </div>

      <div style={{ display: "grid", gridTemplateColumns: "repeat(4,1fr)", gap: 10 }}>
        {[
          { l: "Documents traites", v: "247", c: "#1A6FD4", bg: "#EBF4FF" },
          { l: "Precision OCR", v: "97,3%", c: "#10B981", bg: "#D1FAE5" },
          { l: "Temps moyen", v: "2,4 sec", c: "#7C3AED", bg: "#EDE9FE" },
          { l: "NINEA detectes", v: "99,1%", c: "#F59E0B", bg: "#FEF3C7" },
        ].map(m => (
          <div key={m.l} style={{ background: m.bg, borderRadius: 10, padding: "10px 14px" }}>
            <p style={{ fontSize: 10, color: m.c, marginBottom: 3 }}>{m.l}</p>
            <p style={{ fontSize: 18, fontWeight: 600, color: m.c }}>{m.v}</p>
          </div>
        ))}
      </div>

      {step === "upload" && (
        <div
          onDragOver={e => { e.preventDefault(); setDragOver(true); }}
          onDragLeave={() => setDragOver(false)}
          onDrop={e => { e.preventDefault(); setDragOver(false); handleFile(); }}
          style={{ border: "2px dashed " + (dragOver ? "#1A6FD4" : "var(--bn-border)"), borderRadius: 16, padding: 40, textAlign: "center", background: dragOver ? "#EBF4FF" : "white", cursor: "pointer" }}
          onClick={handleFile}
        >
          <div style={{ width: 60, height: 60, borderRadius: "50%", background: "#EBF4FF", display: "flex", alignItems: "center", justifyContent: "center", margin: "0 auto 16px" }}>
            <i className="ti ti-file-upload" style={{ fontSize: 28, color: "#1A6FD4" }}></i>
          </div>
          <p style={{ fontSize: 16, fontWeight: 600, color: "var(--bn-text)", marginBottom: 6 }}>Deposez votre facture ici</p>
          <p style={{ fontSize: 13, color: "var(--bn-muted)", marginBottom: 16 }}>Formats acceptes : JPG, PNG, PDF - Max 10 MB</p>
          <div style={{ display: "flex", gap: 8, justifyContent: "center", flexWrap: "wrap" }}>
            {["Facture fournisseur","Bon de livraison","Decompte travaux","Releve bancaire"].map(t => (
              <span key={t} style={{ fontSize: 11, padding: "3px 10px", borderRadius: 99, background: "#EBF4FF", color: "#1A6FD4" }}>{t}</span>
            ))}
          </div>
          <p style={{ fontSize: 12, color: "#1A6FD4", marginTop: 12, fontWeight: 500 }}>Cliquez pour simuler une extraction OCR demo</p>
        </div>
      )}

      {step === "processing" && (
        <div style={{ background: "white", borderRadius: 16, padding: 40, textAlign: "center", border: "1px solid var(--bn-border)" }}>
          <div style={{ width: 60, height: 60, borderRadius: "50%", background: "linear-gradient(135deg,#1A6FD4,#7C3AED)", display: "flex", alignItems: "center", justifyContent: "center", margin: "0 auto 20px" }}>
            <i className="ti ti-settings" style={{ fontSize: 28, color: "white", animation: "spin 1s linear infinite" }}></i>
          </div>
          <p style={{ fontSize: 16, fontWeight: 600, marginBottom: 16 }}>Analyse OCR en cours...</p>
          <div style={{ display: "flex", flexDirection: "column", gap: 8, maxWidth: 280, margin: "0 auto" }}>
            {["Detection du document", "Extraction texte OCR", "Identification entites", "Validation NINEA APIX"].map(s => (
              <div key={s} style={{ display: "flex", alignItems: "center", gap: 8, fontSize: 12, color: "var(--bn-muted)", background: "#D1FAE5", borderRadius: 6, padding: "5px 10px" }}>
                <i className="ti ti-check" style={{ color: "#10B981", fontSize: 14 }}></i>{s}
              </div>
            ))}
          </div>
          <style>{"@keyframes spin{from{transform:rotate(0deg)}to{transform:rotate(360deg)}}"}</style>
        </div>
      )}

      {step === "result" && editData && (
        <div style={{ background: "white", borderRadius: 16, padding: 24, border: "1px solid #10B981" }}>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 16 }}>
            <p style={{ fontSize: 15, fontWeight: 600, color: "#065F46" }}>Donnees extraites - Verifiez et corrigez si besoin</p>
            <span style={{ fontSize: 11, fontWeight: 600, padding: "3px 10px", borderRadius: 99, background: "#D1FAE5", color: "#065F46" }}>Confiance 97%</span>
          </div>
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: 14 }}>
            {[
              { l: "Fournisseur", k: "vendor" },
              { l: "NINEA", k: "ninea" },
              { l: "Montant HT (FCFA)", k: "amount" },
              { l: "TVA (FCFA)", k: "tva" },
              { l: "Date facture", k: "date" },
            ].map(f => (
              <div key={f.k}>
                <label style={{ fontSize: 11, fontWeight: 600, color: "var(--bn-muted)", display: "block", marginBottom: 5 }}>{f.l}</label>
                <input
                  value={(editData as any)[f.k]}
                  onChange={e => setEditData(p => p ? {...p, [f.k]: e.target.value} : p)}
                  style={inp}
                />
              </div>
            ))}
            <div style={{ gridColumn: "1/3" }}>
              <label style={{ fontSize: 11, fontWeight: 600, color: "var(--bn-muted)", display: "block", marginBottom: 5 }}>Description</label>
              <input value={editData.description} onChange={e => setEditData(p => p ? {...p, description: e.target.value} : p)} style={inp} />
            </div>
          </div>
          <div style={{ display: "flex", gap: 10, marginTop: 16 }}>
            <button onClick={confirm} style={{ flex: 2, padding: 10, borderRadius: 8, background: "linear-gradient(135deg,#10B981,#059669)", color: "white", border: "none", cursor: "pointer", fontSize: 13, fontWeight: 600 }}>
              Creer l engagement avec ces donnees
            </button>
            <button onClick={() => setStep("upload")} style={{ flex: 1, padding: 10, borderRadius: 8, border: "1px solid var(--bn-border)", background: "transparent", cursor: "pointer", fontSize: 13, color: "var(--bn-muted)" }}>
              Recommencer
            </button>
          </div>
        </div>
      )}

      {step === "confirm" && (
        <div style={{ background: "#D1FAE5", borderRadius: 16, padding: 24, border: "1px solid #A7F3D0", textAlign: "center" }}>
          <i className="ti ti-circle-check" style={{ fontSize: 40, color: "#065F46", display: "block", marginBottom: 8 }}></i>
          <p style={{ fontSize: 16, fontWeight: 600, color: "#065F46", marginBottom: 4 }}>Engagement cree avec succes !</p>
          <p style={{ fontSize: 13, color: "#065F46" }}>Reference BC-2026-{String(Math.floor(Math.random()*900+100))} generee. Statut: En attente de validation.</p>
          <button onClick={() => setStep("upload")} style={{ marginTop: 14, padding: "8px 20px", borderRadius: 8, background: "#065F46", color: "white", border: "none", cursor: "pointer", fontSize: 13 }}>
            Importer une autre facture
          </button>
        </div>
      )}

      <div style={{ background: "white", borderRadius: 14, padding: 16, border: "1px solid var(--bn-border)" }}>
        <p style={{ fontSize: 13, fontWeight: 600, marginBottom: 10 }}>Derniers documents traites</p>
        {DEMOS.map((d, i) => (
          <div key={i} style={{ display: "flex", justifyContent: "space-between", alignItems: "center", padding: "8px 0", borderBottom: "0.5px solid var(--bn-border)", fontSize: 12 }}>
            <div style={{ display: "flex", gap: 10, alignItems: "center" }}>
              <div style={{ width: 32, height: 32, borderRadius: 6, background: "#EBF4FF", display: "flex", alignItems: "center", justifyContent: "center" }}>
                <i className="ti ti-file-text" style={{ color: "#1A6FD4", fontSize: 16 }}></i>
              </div>
              <div>
                <p style={{ fontWeight: 500 }}>{d.vendor} - {d.description.slice(0, 42)}...</p>
                <p style={{ color: "var(--bn-muted)", fontSize: 11 }}>{d.date}</p>
              </div>
            </div>
            <div style={{ textAlign: "right" }}>
              <p style={{ fontWeight: 600, color: "#1A6FD4" }}>{d.amount} FCFA</p>
              <span style={{ fontSize: 10, padding: "1px 7px", borderRadius: 99, background: "#D1FAE5", color: "#065F46" }}>Traite</span>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
