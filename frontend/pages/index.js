export default function Home() {
  return (
    <div className="container">

      {}
      <div className="heroBanner">
        <div className="heroOverlay">
          <h1 className="heroTitle">BeautySalon</h1>
          <p className="heroText">
            Салон краси, де професіоналізм поєднується з комфортом.
            Ми створюємо стиль, який підкреслює вашу індивідуальність.
          </p>

          <a href="/book" className="btn heroBtn">
            Записатися онлайн
          </a>
        </div>
      </div>

  <div className="grid grid2">
    <div className="card">
        <h2 className="h2">Про нас</h2>
        <p className="muted">
          BeautySalon — це сучасний салон краси з командою досвідчених майстрів.
          Ми працюємо з якісними матеріалами, дбаємо про комфорт клієнтів
          та пропонуємо зручний онлайн-запис у будь-який час.
        </p>
    </div>
    <div className="card">
      <h2 className="h2">Години роботи</h2>
      <p className="muted">Понеділок – Неділя: 08:00 – 20:00</p>
    </div>
  </div>

    </div>
  );
}
