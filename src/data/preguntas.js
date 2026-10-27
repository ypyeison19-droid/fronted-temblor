// src/data/preguntas.js

// Preguntas educativas sobre sismos, placas tectónicas y escalas
export const PREGUNTAS_TRIVIA = [
  {
    id: 1,
    pregunta: "¿Qué es el Cinturón de Fuego del Pacífico?",
    opciones: [
      "Una zona volcánica y de alta actividad sísmica alrededor del Océano Pacífico.",
      "Un anillo formado por incendios forestales en verano.",
      "Una línea imaginaria que divide los hemisferios terrestre.",
      "Un grupo de cometas que orbitan cerca de la Tierra."
    ],
    correcta: 0,
    explicacion: "El Cinturón de Fuego concentra el 75% de los volcanes activos del mundo y cerca del 90% de los sismos debido al choque de placas tectónicas."
  },
  {
    id: 2,
    pregunta: "¿Cuál es la diferencia entre la escala de Richter y la de Mercalli?",
    opciones: [
      "Richter mide la intensidad en personas y Mercalli mide el costo económico.",
      "Richter mide la energía/magnitud liberada y Mercalli mide los daños e intensidad percibida.",
      "Mercalli es para terremotos marinos y Richter para terremotos en tierra.",
      "Ambas escalas miden exactamente la misma variable física."
    ],
    correcta: 1,
    explicacion: "La escala de Richter (o magnitud de momento) cuantifica la energía liberada en el epicentro, mientras que la escala de Mercalli evalúa los efectos y daños observados en la superficie."
  },
  {
    id: 3,
    pregunta: "¿Qué debes hacer INMEDIATAMENTE durante un sismo si estás en interiores?",
    opciones: [
      "Correr rápidamente hacia las escaleras o ascensor.",
      "Agacharse, cubrirse debajo de una mesa firme y sujetarse.",
      "Asomarse al balcón a pedir ayuda.",
      "Encender la luz y encender la estufa para cocinar alimentos."
    ],
    correcta: 1,
    explicacion: "La técnica 'Agacharse, Cubrirse y Sujetarse' reduce drásticamente las lesiones por caída de objetos o colapso de techos."
  },
  {
    id: 4,
    pregunta: "¿Qué causa un choque entre dos placas tectónicas?",
    opciones: [
      "Fuerzas magnéticas del núcleo de la Luna.",
      "Acumulación y liberación repentina de energía de deformación en la litosfera.",
      "La fricción excesiva del viento en las montañas.",
      "Los cambios extremos de temperatura entre el día y la noche."
    ],
    correcta: 1,
    explicacion: "Las placas tectónicas se mueven lentamente sobre la astenosfera; cuando se traban y la energía acumulada supera la resistencia de la roca, ocurre la ruptura sísmica."
  },
  {
    id: 5,
    pregunta: "¿Por qué NO debes usar el ascensor durante un terremoto?",
    opciones: [
      "Porque consume más electricidad de lo normal.",
      "Por el riesgo de corte de energía, atrapamiento o fallo en los cables de tracción.",
      "Porque los ascensores suben demasiado rápido durante los temblores.",
      "Porque las puertas se bloquean intencionalmente por leyes de tránsito."
    ],
    correcta: 1,
    explicacion: "Los cortes de energía eléctrica y el descarrilamiento de los rieles del ascensor son frecuentes durante un sismo, dejando atrapados a los ocupantes."
  },
  {
    id: 6,
    pregunta: "¿Qué elementos son prioritarios en una Mochila de Emergencia?",
    opciones: [
      "Agua embotellada, linterna, radio a pilas, botiquín y enlatados.",
      "Juegos de mesa, maquillaje y joyas de valor.",
      "Ropa formal, computador de escritorio y herramientas pesadas.",
      "Solo dinero en efectivo y libros de literatura."
    ],
    correcta: 0,
    explicacion: "Los insumos de vital importancia garantizan supervivencia en las primeras 72 horas posteriores a un desastre."
  },
  {
    id: 7,
    pregunta: "¿Qué es el hipocentro de un sismo?",
    opciones: [
      "El punto en la superficie directamente arriba del temblor.",
      "El punto del interior de la Tierra donde se origina la ruptura sísmica.",
      "El instrumento que mide las ondas sísmicas.",
      "La línea imaginaria del ecuador terrestre."
    ],
    correcta: 1,
    explicacion: "El hipocentro (o foco) es el punto interno donde se libera la energía. El epicentro es su proyección vertical en la superficie."
  },
  {
    id: 8,
    pregunta: "Si estás en la calle durante un sismo, ¿cuál es la zona más segura?",
    opciones: [
      "Debajo de postes de luz y cables eléctricos.",
      "Cerca de fachadas de edificios con grandes ventanales de vidrio.",
      "En espacios abiertos lejos de edificios, árboles y postes.",
      "Dentro de un automóvil estacionado debajo de un puente."
    ],
    correcta: 2,
    explicacion: "Mantenerse en campos abiertos evita el impacto de vidrios rotos, postes caídos y mampostería de edificaciones."
  },
  {
    id: 9,
    pregunta: "¿Qué es la licuefacción del suelo?",
    opciones: [
      "Proceso donde el suelo saturado de agua pierde resistencia y actúa como un líquido por la vibración.",
      "Derretimiento de la nieve en las cumbres volcánicas.",
      "Evaporación instantánea de los ríos durante un temblor.",
      "Formación de pequeñas grietas en el pavimento de asfalto."
    ],
    correcta: 0,
    explicacion: "En suelos arenosos o saturados de agua, las vibraciones aumentan la presión de los poros haciendo que la tierra pierda firmeza y colapse las estructuras."
  },
  {
    id: 10,
    pregunta: "¿Cuál es el primer paso después de que termina la sacudida principal?",
    opciones: [
      "Verificar fugas de gas, estado de heridos y evacuar con calma hacia zonas seguras.",
      "Correr inmediatamente a buscar llaves de la casa.",
      "Usar fósforos o encendedores para revisar la oscuridad.",
      "Encender la televisión a máximo volumen."
    ],
    correcta: 0,
    explicacion: "Verificar si hay fugas de gas previene incendios secundarios. Nunca enciendas fuego o interruptores si sospechas de una fuga de gas."
  }
];

// Elementos para el minijuego de la Mochila
export const OBJETOS_MOCHILA = [
  { id: 'agua', nombre: '💧 Agua embotellada', esCorrecto: true },
  { id: 'radio', nombre: '📻 Radio a pilas', esCorrecto: true },
  { id: 'botiquin', nombre: '🩹 Botiquín primeros auxilios', esCorrecto: true },
  { id: 'linterna', nombre: '🔦 Linterna LED', esCorrecto: true },
  { id: 'enlatados', nombre: '🥫 Comida enlatada', esCorrecto: true },
  { id: 'pito', nombre: '📣 Silbato / Pito', esCorrecto: true },
  { id: 'laptop', nombre: '💻 Laptop Gamer', esCorrecto: false },
  { id: 'adorno', nombre: '🏺 Florero de cristal', esCorrecto: false },
  { id: 'sartén', nombre: '🍳 Sartén pesado', esCorrecto: false },
  { id: 'tacones', nombre: '👠 Zapatos de tacón', esCorrecto: false }
];

// Escenarios para el Simulacro en tiempo real
export const ESCENARIOS_SIMULACRO = [
  {
    id: 'casa',
    titulo: '🏡 Escenario: Casa / Habitación',
    magnitud: '6.5 M_w',
    opciones: [
      { texto: 'Cubrirse debajo de la mesa o cama firme', correcta: true, expl: '¡Excelente! Proteger cabeza y cuello debajo de un mueble pesado evita impactos de lámparas o techo.' },
      { texto: 'Correr hacia el balcón o ventana', correcta: false, expl: 'Error. Los balcones y fachadas son las estructuras más propensas a colapsar.' },
      { texto: 'Intentar salvar el televisor', correcta: false, expl: 'Error. Jamás arriesgues tu vida por objetos materiales.' }
    ]
  },
  {
    id: 'colegio',
    titulo: '🏫 Escenario: Aula de Clases',
    magnitud: '7.0 M_w',
    opciones: [
      { texto: 'Empujar a los compañeros para salir primero', correcta: false, expl: 'Error. Generar estampidas causa pisoteos y lesiones graves.' },
      { texto: 'Agacharse debajo del pupitre y sujetarse de las patas', correcta: true, expl: '¡Correcto! El pupitre amortigua caídas de objetos o pedazos de pared.' },
      { texto: 'Correr directo al ascensor del edificio', correcta: false, expl: 'Error. Los ascensores quedan fuera de servicio o atascados durante el sismo.' }
    ]
  },
  {
    id: 'calle',
    titulo: '🏙️ Escenario: Vía Pública / Calle',
    magnitud: '5.8 M_w',
    opciones: [
      { texto: 'Alejarse de edificios, postes de luz y cables', correcta: true, expl: '¡Perfecto! El área despejada minimiza riesgos por caída de mampostería o cables energizados.' },
      { texto: 'Abrazarse a un poste de energía eléctrica', correcta: false, expl: 'Error. El poste puede colapsar o electrocutarte si los cables se rompen.' },
      { texto: 'Refugiarse justo debajo del alero del edificio', correcta: false, expl: 'Error. El borde de las fachadas desprende vidrios y ladrillos sueltos.' }
    ]
  },
  {
    id: 'ccomercial',
    titulo: '🛍️ Escenario: Centro Comercial',
    magnitud: '7.2 M_w',
    opciones: [
      { texto: 'Correr gritando hacia la puerta de salida', correcta: false, expl: 'Error. La desesperación colectiva genera aplastamiento en los accesos.' },
      { texto: 'Ubicarse lejos de escaparates de vidrio y cubrir la cabeza', correcta: true, expl: '¡Correcto! Los escaparates de tiendas estallan por la vibración del terreno.' },
      { texto: 'Usar la escalera mecánica en movimiento', correcta: false, expl: 'Error. Las escaleras mecánicas se frenan bruscamente lanzando a las personas.' }
    ]
  }
];