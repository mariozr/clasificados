/**
 * Returns a high-quality curated image URL from Unsplash based on the category name or icon class.
 * This is used as an aesthetic fallback when an advertisement has no image uploaded.
 * 
 * @param {string} categoryName The name of the category (e.g. "Vehículos", "Tecnología")
 * @param {string} categoryIcon The FontAwesome icon class of the category (e.g. "fa-car")
 * @returns {string} High quality image URL
 */
export function getCategoryImage(categoryName = '', categoryIcon = '') {
  const name = categoryName.toLowerCase().trim()
  const icon = categoryIcon.toLowerCase().trim()

  // 1. Check by Category Name
  if (name.includes('vehic') || name.includes('auto') || name.includes('moto') || name.includes('car')) {
    return 'https://images.unsplash.com/photo-1503376780353-7e6692767b70?w=800&auto=format&fit=crop&q=80'
  }
  if (name.includes('inmueb') || name.includes('propiedad') || name.includes('casa') || name.includes('depto') || name.includes('departamento') || name.includes('terreno') || name.includes('alquiler')) {
    return 'https://images.unsplash.com/photo-1564013799919-ab600027ffc6?w=800&auto=format&fit=crop&q=80'
  }
  if (name.includes('tecnolog') || name.includes('electron') || name.includes('celular') || name.includes('computadora') || name.includes('computacion') || name.includes('tv') || name.includes('audio') || name.includes('video') || name.includes('gamer') || name.includes('playstation')) {
    return 'https://images.unsplash.com/photo-1498049794561-7780e7231661?w=800&auto=format&fit=crop&q=80'
  }
  if (name.includes('hogar') || name.includes('muebl') || name.includes('decor') || name.includes('jardin') || name.includes('bazar')) {
    return 'https://images.unsplash.com/photo-1524758631624-e2822e304c36?w=800&auto=format&fit=crop&q=80'
  }
  if (name.includes('moda') || name.includes('ropa') || name.includes('vestir') || name.includes('calzado') || name.includes('indumentaria') || name.includes('accesorios')) {
    return 'https://images.unsplash.com/photo-1483985988355-763728e1935b?w=800&auto=format&fit=crop&q=80'
  }
  if (name.includes('servicio') || name.includes('empleo') || name.includes('trabajo') || name.includes('profesional')) {
    return 'https://images.unsplash.com/photo-1454165804606-c3d57bc86b40?w=800&auto=format&fit=crop&q=80'
  }
  if (name.includes('deport') || name.includes('bici') || name.includes('fit') || name.includes('ciclismo') || name.includes('gym')) {
    return 'https://images.unsplash.com/photo-1461896836934-ffe607ba8211?w=800&auto=format&fit=crop&q=80'
  }
  if (name.includes('mascot') || name.includes('perro') || name.includes('gato') || name.includes('animal')) {
    return 'https://images.unsplash.com/photo-1543466835-00a7907e9de1?w=800&auto=format&fit=crop&q=80'
  }
  if (name.includes('music') || name.includes('instrumento') || name.includes('sonido')) {
    return 'https://images.unsplash.com/photo-1511192336575-5a79af67a629?w=800&auto=format&fit=crop&q=80'
  }
  if (name.includes('libro') || name.includes('educac') || name.includes('estudio') || name.includes('colegio')) {
    return 'https://images.unsplash.com/photo-1497633762265-9d179a990aa6?w=800&auto=format&fit=crop&q=80'
  }
  if (name.includes('juguet') || name.includes('bebe') || name.includes('niño') || name.includes('infantil')) {
    return 'https://images.unsplash.com/photo-1536640712267-de4d723447aa?w=800&auto=format&fit=crop&q=80'
  }
  if (name.includes('herramienta') || name.includes('construc') || name.includes('ferreter') || name.includes('maquinaria')) {
    return 'https://images.unsplash.com/photo-1581092160607-ee22621dd758?w=800&auto=format&fit=crop&q=80'
  }

  // 2. Fallback check by Category Icon
  if (icon.includes('car') || icon.includes('motorcycle') || icon.includes('truck')) {
    return 'https://images.unsplash.com/photo-1503376780353-7e6692767b70?w=800&auto=format&fit=crop&q=80'
  }
  if (icon.includes('home') || icon.includes('building') || icon.includes('house')) {
    return 'https://images.unsplash.com/photo-1564013799919-ab600027ffc6?w=800&auto=format&fit=crop&q=80'
  }
  if (icon.includes('laptop') || icon.includes('mobile') || icon.includes('tv') || icon.includes('desktop') || icon.includes('tablet') || icon.includes('gamepad')) {
    return 'https://images.unsplash.com/photo-1498049794561-7780e7231661?w=800&auto=format&fit=crop&q=80'
  }
  if (icon.includes('couch') || icon.includes('bed') || icon.includes('chair') || icon.includes('sink')) {
    return 'https://images.unsplash.com/photo-1524758631624-e2822e304c36?w=800&auto=format&fit=crop&q=80'
  }
  if (icon.includes('shirt') || icon.includes('gem') || icon.includes('bag') || icon.includes('glasses')) {
    return 'https://images.unsplash.com/photo-1483985988355-763728e1935b?w=800&auto=format&fit=crop&q=80'
  }
  if (icon.includes('briefcase') || icon.includes('user-tie') || icon.includes('handshake')) {
    return 'https://images.unsplash.com/photo-1454165804606-c3d57bc86b40?w=800&auto=format&fit=crop&q=80'
  }
  if (icon.includes('bicycle') || icon.includes('dumbbell') || icon.includes('football') || icon.includes('running')) {
    return 'https://images.unsplash.com/photo-1461896836934-ffe607ba8211?w=800&auto=format&fit=crop&q=80'
  }
  if (icon.includes('paw') || icon.includes('dog') || icon.includes('cat')) {
    return 'https://images.unsplash.com/photo-1543466835-00a7907e9de1?w=800&auto=format&fit=crop&q=80'
  }
  if (icon.includes('music') || icon.includes('guitar') || icon.includes('headphones')) {
    return 'https://images.unsplash.com/photo-1511192336575-5a79af67a629?w=800&auto=format&fit=crop&q=80'
  }
  if (icon.includes('book') || icon.includes('graduation') || icon.includes('school')) {
    return 'https://images.unsplash.com/photo-1497633762265-9d179a990aa6?w=800&auto=format&fit=crop&q=80'
  }
  if (icon.includes('baby') || icon.includes('child')) {
    return 'https://images.unsplash.com/photo-1536640712267-de4d723447aa?w=800&auto=format&fit=crop&q=80'
  }
  if (icon.includes('tools') || icon.includes('wrench') || icon.includes('hammer')) {
    return 'https://images.unsplash.com/photo-1581092160607-ee22621dd758?w=800&auto=format&fit=crop&q=80'
  }

  // 3. Ultimate Fallback (Default Marketplace Ad Cover)
  return '/default-ad.png'
}
