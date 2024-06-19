document.addEventListener('DOMContentLoaded', function () {
  const imageContainer = document.querySelector('.main');
  const image = document.getElementById('image-display');
  const zoomLens = document.getElementById('zoom-lens');

  imageContainer.addEventListener('mousemove', moveLens);
  imageContainer.addEventListener('mouseleave', () => {
    zoomLens.style.display = 'none';
  });

  function moveLens(e) {
    const { top, left, width, height } = image.getBoundingClientRect();
    const x = e.pageX - left;
    const y = e.pageY - top;

    // Mostrar a lente
    zoomLens.style.display = 'block';

    // Calcular a posição da lente
    const lensX = x - zoomLens.offsetWidth / 2;
    const lensY = y - zoomLens.offsetHeight / 2;

    // Definir a posição da lente
    zoomLens.style.left = `${lensX +100}px`;
    zoomLens.style.top = `${lensY +100}px`;

    // Calcular a posição do fundo da lente
    const bgX = (x / width) * 100;
    const bgY = (y / height) * 100;

    // Definir a imagem de fundo e a posição
    zoomLens.style.backgroundImage = `url(${image.src})`;
    zoomLens.style.backgroundPosition = `${bgX}% ${bgY}%`;
    zoomLens.style.backgroundSize = `${width}px ${height}px`;
  }
});
