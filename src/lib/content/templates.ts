import type { BookSection } from "./types";

/* Helpers ------------------------------------------------------------------ */

const q = (title: string, prompts: string[], intro?: string): BookSection => ({
  title,
  intro,
  kind: "questions",
  prompts,
});
const photos = (title: string, prompts: string[], intro?: string): BookSection => ({
  title,
  intro,
  kind: "photos",
  prompts,
});
const letter = (title: string, prompts: string[], intro?: string): BookSection => ({
  title,
  intro,
  kind: "letter",
  prompts,
});
const dedication = (intro: string): BookSection => ({
  title: "Dedicatoria",
  intro,
  kind: "dedication",
  prompts: ["Para:", "De parte de:", "Fecha:"],
});

type G = {
  /** mamá / papá / abuela / abuelo */
  rol: string;
  /** chica / chico */
  chica: string;
  /** a / o */
  a: string;
  /** misma / mismo */
  misma: string;
};

export const MUJER = { chica: "chica", a: "a", misma: "misma" };
export const VARON = { chica: "chico", a: "o", misma: "mismo" };

/* Madres y padres ---------------------------------------------------------- */

export function parentSections(g: G) {
  const { rol, chica, a, misma } = g;
  return {
    dedicatoria: dedication(
      `Escribí aquí por qué le regalás este libro a tu ${rol}. Es lo primero que va a leer cuando lo abra.`,
    ),
    antes: q(
      "Antes de que yo naciera",
      [
        "¿Dónde vivías y cómo era un día cualquiera de tu vida antes de que yo llegara?",
        "¿Qué música sonaba en tu casa en esa época?",
        "¿Qué te imaginabas de mí antes de conocerme?",
        "Si pudieras mandarle un mensaje a la persona que eras entonces, ¿qué le dirías?",
      ],
      "Hay una parte de tu vida que yo no vi. Empecemos por ahí.",
    ),
    infancia: q("Tu infancia", [
      "¿Cuál es el primer recuerdo que tenés? Contalo con todos los detalles que puedas.",
      "¿Cómo era la casa donde creciste? ¿Qué rincón era tu favorito?",
      "¿Qué olor te lleva directo a tu infancia?",
      `¿Qué te daba miedo de ${chica} y qué te hacía sentir a salvo?`,
      "¿Cómo era tu barrio? ¿Quiénes eran tus vecinos?",
    ]),
    escuela: q("Tu escuela", [
      "¿Cómo se llamaba tu escuela y cómo llegabas todos los días?",
      "¿Qué maestra o maestro te marcó? ¿Por qué?",
      "¿Qué materia te encantaba y cuál sufrías?",
      "¿Qué traías en la mochila o en la cartuchera que hoy te daría ternura ver?",
    ]),
    familia: q("Tu familia", [
      "¿Cómo eran las comidas en tu casa? ¿Quién cocinaba y qué plato no podía faltar?",
      "¿Qué tradiciones tenía tu familia que hoy extrañás?",
      "¿Había alguna frase o dicho que se repetía siempre en tu casa?",
      "¿Qué historia familiar escuchaste tantas veces que te la sabés de memoria?",
    ]),
    padres: q("Tus padres", [
      "¿Cómo se conocieron tus padres? ¿Qué te contaron de esa historia?",
      "¿Qué heredaste de tu mamá? ¿Y de tu papá?",
      "¿Cuál es el mejor consejo que te dieron?",
      "¿Qué te gustaría haberles preguntado y nunca les preguntaste?",
    ]),
    hermanos: q("Tus hermanos", [
      "¿Cómo era tu relación con tus hermanos o con los chicos con los que creciste?",
      "¿Cuál fue la travesura más grande que hicieron juntos?",
      "¿Por qué se peleaban y cómo se amigaban?",
      "¿Qué te gustaría decirles hoy?",
    ]),
    juegos: q("Tus juegos", [
      `¿A qué jugabas cuando eras ${chica}? ¿Con quién?`,
      "¿Tuviste un juguete preferido? ¿Qué pasó con él?",
      "¿Cómo eran tus veranos?",
      "¿Qué juego de tu infancia te gustaría enseñarme?",
    ]),
    suenos: q("Tus sueños", [
      "¿Qué querías ser cuando fueras grande?",
      "¿Qué lugar del mundo soñabas conocer?",
      "¿A quién admirabas?",
      "¿Cuál de esos sueños se cumplió de una manera que no esperabas?",
    ]),
    adolescencia: q("Tu adolescencia", [
      "¿Cómo te vestías y cómo te peinabas a los quince?",
      "¿Quiénes eran tus amigos? ¿Dónde se juntaban?",
      "¿Qué música escuchabas a todo volumen?",
      `¿Cuándo fue la primera vez que te sentiste grande?`,
      "¿Qué hacían un sábado a la noche?",
    ]),
    amores: q("Tus primeros amores", [
      "¿Te acordás de tu primer amor? ¿Cómo empezó?",
      "¿Cuál fue tu primera cita? ¿Adónde fueron?",
      "¿Qué canción te devuelve a esa época?",
      "¿Qué aprendiste del amor que te gustaría que yo supiera?",
    ]),
    decisiones: q("Las decisiones que cambiaron tu vida", [
      "¿Cuál fue la decisión más valiente que tomaste?",
      "¿Hubo algún momento en el que tu vida pudo haber ido para otro lado?",
      `¿De qué estás más orgullos${a}?`,
      "¿Qué harías distinto y qué volverías a hacer igual?",
    ]),
    trabajo: q("Tu trabajo y tus oficios", [
      "¿Cuál fue tu primer trabajo? ¿Qué hiciste con tu primer sueldo?",
      "¿Qué trabajo disfrutaste más y por qué?",
      "¿Qué aprendiste trabajando que no te enseñó nadie?",
      "¿Hay algo que sepas hacer con las manos y que quieras que no se pierda?",
    ]),
    convertirse: q(`Cuando te convertiste en ${rol}`, [
      `¿Cómo te enteraste de que ibas a ser ${rol}? ¿Qué sentiste?`,
      "¿Qué recordás del primer día que me tuviste en brazos?",
      "¿Qué fue lo más difícil de los primeros tiempos? ¿Y lo más lindo?",
      "¿Cómo eligieron mi nombre?",
      "¿Qué recuerdo de mi infancia te sigue haciendo reír?",
    ]),
    aprendiste: q("Lo que aprendiste", [
      "¿Qué sabés hoy que te hubiera gustado saber a los veinte?",
      "¿Qué te enseñó la vida a la fuerza?",
      "¿Qué cosas aprendiste a soltar?",
      "¿Qué te sigue dando curiosidad?",
    ]),
    felices: q("Tus momentos más felices", [
      "Si pudieras volver a vivir un día entero, ¿cuál elegirías?",
      "¿Cuándo te reíste tanto que te dolió la panza?",
      "¿Cuál fue el mejor viaje de tu vida?",
      "¿Qué pequeñas cosas te hacen feliz hoy?",
    ]),
    dificiles: q(
      "Tus momentos difíciles",
      [
        "¿Cuál fue el momento más difícil que te tocó atravesar?",
        "¿Quién estuvo a tu lado?",
        "¿Qué te ayudó a seguir adelante?",
        `¿Qué descubriste de vos ${misma} en esos momentos?`,
      ],
      "Contá solo lo que tengas ganas de contar. Una línea también es una respuesta.",
    ),
    personas: q("Las personas que marcaron tu vida", [
      "¿Quién fue la persona que más te enseñó?",
      "¿Hay alguien a quien nunca le agradeciste lo suficiente?",
      "¿Qué amistad te acompaña desde hace más tiempo?",
      "¿A quién extrañás y qué te gustaría contarle?",
    ]),
    anecdotas: q("Anécdotas que hay que contar", [
      "¿Cuál es la historia que contás en todas las sobremesas?",
      "¿Cuál fue la vez que más vergüenza pasaste?",
      "¿Qué te pasó que nadie te cree?",
      "¿Cuál es la mejor historia que tenés de un viaje, una fiesta o un casamiento?",
    ]),
    nuncaContaste: q("Lo que nunca me contaste", [
      "¿Qué secreto inofensivo nunca me contaste?",
      "¿Hay alguna historia tuya que creas que no conozco?",
      "¿Qué te animaste a hacer que yo ni me imagino?",
      `¿Qué te gustaría que supiera de vos, más allá de ser mi ${rol}?`,
    ]),
    vosHoy: q("Vos, hoy", [
      "¿Cómo es tu mañana ideal?",
      "¿Qué libro, película o canción te acompaña últimamente?",
      "¿Qué te da paz?",
      "¿Qué te gustaría que te pregunte más seguido?",
    ]),
    recetas: q(
      "Tus recetas",
      [
        "La receta que más te piden (ingredientes y pasos):",
        "La receta de tu infancia que querés que no se pierda:",
        "Tu truco de cocina que nadie conoce:",
      ],
      "Escribila como la decís vos: con tus medidas, tus 'un poquito' y tus 'a ojo'.",
    ),
    consejos: q("Tus consejos", [
      "¿Qué consejo me darías para los días tristes?",
      "¿Qué consejo me darías sobre el amor? ¿Y sobre el trabajo?",
      "¿Qué tiene que saber alguien que recién empieza a ser adulto?",
      "¿Qué frase tuya te gustaría que yo repitiera algún día?",
    ]),
    pendientes: q("Tus sueños pendientes", [
      "¿Qué cosa todavía tenés ganas de hacer?",
      "¿Qué lugar te queda por conocer?",
      "¿Qué te gustaría aprender?",
      "¿Hay algún sueño pendiente que podamos cumplir juntos?",
    ]),
    recordar: q("Lo que querés que recuerde siempre", [
      "¿Cómo te gustaría que te recordemos?",
      "¿Qué valores esperás que sigamos transmitiendo?",
      "¿Qué historia tuya querés que les cuente a mis hijos?",
      "Completá la frase: «Nunca te olvides de…»",
    ]),
    fotos: photos(
      "Fotografías",
      [
        `Una foto de cuando eras ${chica}`,
        "Una foto con tus padres",
        "Una foto de tu juventud",
        "Una foto de nosotros",
      ],
      "Pegá aquí las fotos y escribí debajo quién aparece, dónde y cuándo.",
    ),
    cartas: letter(
      "Espacio para cartas",
      ["Una carta para quien vos quieras"],
      "Una carta para alguien de la familia, para un amigo o para tu yo del pasado.",
    ),
    final: letter(`Mensaje final para tus hijos`, [
      "Lo que quiero decirte, ahora que terminé de escribir este libro:",
    ]),
  };
}

export const PARENT_FULL = [
  "dedicatoria",
  "antes",
  "infancia",
  "familia",
  "padres",
  "hermanos",
  "juegos",
  "suenos",
  "adolescencia",
  "amores",
  "decisiones",
  "convertirse",
  "aprendiste",
  "felices",
  "dificiles",
  "personas",
  "nuncaContaste",
  "consejos",
  "pendientes",
  "recordar",
  "fotos",
  "cartas",
  "final",
] as const;

/* Abuelos ------------------------------------------------------------------ */

export function grandparentSections(g: G & { pareja: string }) {
  const { rol, chica, a, pareja } = g;
  return {
    dedicatoria: dedication(
      `Escribí aquí qué significa tu ${rol} para vos y por qué querés guardar sus historias.`,
    ),
    raices: q(
      "De dónde venimos",
      [
        "¿De dónde eran tus padres y tus abuelos? ¿Cómo llegaron hasta acá?",
        "¿Sabés por qué la familia tiene el apellido que tiene?",
        "¿Qué objetos, cartas o fotos antiguas se conservan en la familia?",
        "¿Qué costumbre de tus antepasados seguimos haciendo sin saberlo?",
      ],
      "Todo lo que somos empezó mucho antes. Contanos esa parte.",
    ),
    infancia: q("Tu infancia", [
      "¿Cuál es tu primer recuerdo?",
      "¿Cómo era un domingo en tu casa cuando eras " + chica + "?",
      "¿Qué te regalaban para tu cumpleaños?",
      "¿Qué cosas hacías con tus manos: tejer, arreglar, cocinar, sembrar?",
    ]),
    casa: q("La casa de tu infancia", [
      "Describí la casa donde creciste: la cocina, el patio, tu cama.",
      "¿Había radio, teléfono o televisor? ¿Cuándo llegaron?",
      "¿Qué se escuchaba de noche desde tu cama?",
      "¿Qué plantas o animales había en tu casa?",
    ]),
    mundo: q(
      "Cómo era el mundo entonces",
      [
        "¿Cuánto costaban las cosas? ¿Qué se podía comprar con unas monedas?",
        "¿Cómo se viajaba? ¿Cuál fue tu primer viaje largo?",
        "¿Qué noticia de esos años te acordás como si fuera hoy?",
        "¿Qué invento te pareció mágico la primera vez que lo viste?",
      ],
      "Lo que para vos era normal, para tus nietos es historia.",
    ),
    juventud: q("Tu juventud", [
      "¿Dónde se juntaban los jóvenes en tu época?",
      "¿Cómo eran los bailes? ¿Qué se bailaba?",
      "¿Qué ropa te ponías para una ocasión especial?",
      "¿Qué te hacía sentir libre?",
    ]),
    amor: q(`Cuando conociste ${pareja}`, [
      "¿Dónde y cómo se conocieron?",
      "¿Qué te llamó la atención la primera vez?",
      "¿Cómo fue el casamiento o el momento en que decidieron estar juntos?",
      "¿Cuál es el secreto para compartir una vida entera?",
    ]),
    trabajo: q("Tu trabajo y tus oficios", [
      "¿Cuál fue tu primer trabajo?",
      "¿De qué trabajaste la mayor parte de tu vida?",
      "¿Qué oficio o saber te gustaría enseñarle a alguien de la familia?",
      `¿De qué estás más orgullos${a}?`,
    ]),
    hijos: q("Cuando nacieron tus hijos", [
      "¿Cómo fue el día en que nació tu primer hijo o hija?",
      "¿Cómo eran tus hijos de chicos? Contá una travesura.",
      "¿Qué fue lo más difícil de criar en esa época?",
      "¿Qué cosa de tus hijos te sigue sorprendiendo?",
    ]),
    nietos: q(`Cuando te convertiste en ${rol}`, [
      "¿Qué sentiste cuando te contaron que ibas a tener un nieto?",
      "¿Qué te gusta hacer con tus nietos?",
      "¿En qué se parecen tus nietos a vos?",
      `¿Qué es lo mejor de ser ${rol}?`,
    ]),
    tradiciones: q("Recetas y tradiciones", [
      "La receta de la familia que no se puede perder (paso a paso):",
      "¿Cómo se festejaba la Navidad o las fiestas en tu casa?",
      "¿Qué remedio casero usabas para todo?",
      "¿Qué canción o canción de cuna te cantaban?",
    ]),
    sabiduria: q("Lo que te enseñó la vida", [
      "¿Qué cambió más en el mundo desde que eras joven? ¿Y qué no cambió nada?",
      "¿Qué te costó aprender?",
      "¿Qué consejo le darías a alguien que hoy tiene veinte años?",
      "¿Qué te da alegría a esta altura de la vida?",
    ]),
    paraNietos: letter("Para tus nietos", [
      "Lo que quiero que sepan mis nietos, y los nietos de mis nietos:",
    ]),
    arbol: {
      title: "Nuestro árbol familiar",
      kind: "tree",
      intro: "Completá los nombres, las fechas y los lugares que recuerdes.",
      prompts: ["Tus abuelos", "Tus padres", "Vos y tus hermanos", "Tus hijos", "Tus nietos"],
    } as BookSection,
    fotos: photos(
      "Fotografías",
      ["Una foto de tu juventud", "Una foto de tu casamiento o con tu pareja", "Una foto con tus hijos", "Una foto con tus nietos"],
      "Debajo de cada foto anotá quién aparece, dónde y en qué año.",
    ),
    cartas: letter("Espacio para cartas", ["Una carta para quien vos quieras"]),
  };
}

export const GRANDPARENT_FULL = [
  "dedicatoria",
  "raices",
  "infancia",
  "casa",
  "mundo",
  "juventud",
  "amor",
  "trabajo",
  "hijos",
  "nietos",
  "tradiciones",
  "sabiduria",
  "arbol",
  "fotos",
  "paraNietos",
  "cartas",
] as const;

/* Familia (libros en plural) ---------------------------------------------- */

export function familySections() {
  return {
    dedicatoria: dedication("Escribí aquí para quiénes es este libro y quién empezó a completarlo."),
    origen: q("Dónde empieza nuestra familia", [
      "¿Cuáles son los nombres más antiguos que conocemos de la familia?",
      "¿De qué pueblos, ciudades o países venimos?",
      "¿Qué historia de llegada o mudanza se cuenta en la familia?",
      "¿Qué significa nuestro apellido o de dónde viene?",
    ]),
    abuelos: q("Las historias de los abuelos", [
      "¿Cómo se conocieron los abuelos?",
      "¿De qué trabajaban y cómo era su casa?",
      "¿Qué frase de los abuelos sigue viva en la familia?",
      "¿Qué recuerdo de ellos querés que no se pierda?",
    ]),
    casas: q("Nuestras casas", [
      "¿En qué casas vivió la familia? Escribí las direcciones que recuerdes.",
      "¿Cuál era la casa donde se juntaban todos?",
      "¿Qué objeto pasó de casa en casa y de generación en generación?",
    ]),
    mesa: q("Alrededor de la mesa", [
      "¿Qué se cocinaba los domingos?",
      "¿Quién se sentaba en la cabecera?",
      "¿Cuál es la receta familiar más pedida? Escribila paso a paso.",
      "¿Qué tema siempre aparecía en las sobremesas?",
    ]),
    fiestas: q("Fiestas y tradiciones", [
      "¿Cómo festeja nuestra familia la Navidad, el Año Nuevo o los cumpleaños?",
      "¿Qué ritual nos hace únicos?",
      "¿Cuál fue la fiesta familiar más inolvidable?",
    ]),
    anecdotas: q("Las anécdotas de siempre", [
      "La historia que se cuenta en todas las reuniones:",
      "El día que algo salió muy mal (y hoy nos reímos):",
      "El personaje más divertido de la familia y por qué:",
    ]),
    valores: q("Lo que nos une", [
      "¿Qué valores compartimos como familia?",
      "¿Qué aprendimos de los momentos difíciles?",
      "¿Qué queremos que las próximas generaciones sepan de nosotros?",
    ]),
    arbol: {
      title: "Nuestro árbol familiar",
      kind: "tree",
      intro: "Completen juntos los nombres, las fechas y los lugares.",
      prompts: ["Bisabuelos", "Abuelos", "Padres y tíos", "Hijos y primos", "Nietos"],
    } as BookSection,
    fotos: photos("Fotografías de familia", [
      "La foto más antigua que tenemos",
      "Una foto de los abuelos",
      "Una reunión familiar",
      "Todos juntos, hoy",
    ]),
    cartas: letter("Cartas para el futuro", [
      "Una carta para quienes lean este libro dentro de cincuenta años",
    ]),
  };
}

/* Hermanos ----------------------------------------------------------------- */

export function siblingSections(herm: string) {
  return {
    dedicatoria: dedication(`Escribí aquí qué significa tener un ${herm} como vos.`),
    chicos: q("Cuando éramos chicos", [
      "¿Cuál es el primer recuerdo que tenés de mí?",
      "¿A qué jugábamos que nadie más entendía?",
      "¿Qué apodos nos pusimos?",
      "¿Qué programa de tele o qué canción es de nosotros?",
    ]),
    casa: q("Nuestra casa", [
      "¿Cómo era nuestra habitación (o la tuya y la mía)?",
      "¿Qué olor, ruido o frase te devuelve a esa casa?",
      "¿Qué hacíamos en las vacaciones?",
      "¿Qué comida de casa extrañás?",
    ]),
    peleas: q("Peleas y reconciliaciones", [
      "¿Por qué nos peleábamos más?",
      "¿Cuál fue la pelea más absurda que tuvimos?",
      "¿Quién pedía perdón primero?",
      "¿De qué me defendiste alguna vez?",
    ]),
    secretos: q("Secretos compartidos", [
      "¿Qué secreto me guardaste?",
      "¿Qué travesura nunca descubrieron nuestros padres?",
      "¿Qué cosa solo sabemos vos y yo?",
    ]),
    padres: q("Nuestros padres, según nosotros", [
      "¿Qué frase de mamá o papá nos sabemos de memoria?",
      "¿En qué nos parecemos a ellos?",
      "¿Qué aprendimos de ellos sin que nos lo dijeran?",
    ]),
    crecer: q("Crecer", [
      "¿Cuándo sentiste que dejamos de ser chicos?",
      "¿Qué momento de mi vida te acordás de haber acompañado?",
      "¿Qué cambió entre nosotros con los años?",
    ]),
    admiro: q("Lo que admiro de vos", [
      "Algo que hacés mejor que nadie:",
      "Algo que aprendí de vos:",
      "Una vez que me sentí orgulloso u orgullosa de vos:",
    ]),
    momentos: q("Momentos que no olvido", [
      "El día que más nos reímos juntos:",
      "El viaje o la salida que quiero repetir:",
      "La vez que estuviste cuando más te necesitaba:",
    ]),
    futuro: q("Lo que viene", [
      "¿Qué te gustaría que hagamos juntos?",
      "¿Cómo nos imaginás de viejitos?",
      "Una promesa entre hermanos:",
    ]),
    fotos: photos("Fotografías", [
      "Una foto de cuando éramos chicos",
      "Una foto de una vacación",
      "Una foto de hoy",
    ]),
    cartas: letter("Una carta para vos", ["Lo que nunca te dije y quiero que quede escrito:"]),
  };
}

/* Parejas ------------------------------------------------------------------ */

export function coupleSections() {
  return {
    dedicatoria: dedication("Escribí aquí por qué empezamos este libro."),
    antes: q("Antes de nosotros", [
      "¿Cómo era tu vida el año antes de conocernos?",
      "¿Qué buscabas en el amor en ese momento?",
      "¿Qué pensaba tu familia o tus amigos sobre tu vida amorosa?",
    ]),
    conocimos: q("El día que nos conocimos", [
      "¿Dónde estábamos y qué tenía puesto cada uno?",
      "¿Qué fue lo primero que pensaste de mí?",
      "¿Quién habló primero? ¿Qué dijo?",
      "¿Qué le contaste a alguien sobre mí esa noche?",
    ]),
    primeraCita: q("La primera cita", [
      "¿Adónde fuimos y quién eligió el lugar?",
      "¿Qué salió bien y qué salió mal?",
      "¿Cuándo supiste que querías volver a verme?",
    ]),
    supimos: q("Cuando supimos", [
      "¿Cuándo sentiste que esto era en serio?",
      "¿Quién dijo «te quiero» primero? ¿Dónde?",
      "¿Cómo fue conocer a la familia del otro?",
    ]),
    lugares: q("Nuestros lugares", [
      "El bar, la plaza o el rincón que es nuestro:",
      "La primera casa que compartimos:",
      "Un lugar al que siempre queremos volver:",
    ]),
    canciones: q("Nuestras canciones", [
      "La canción que nos define:",
      "La canción que te hace pensar en mí:",
      "La que bailamos aunque nadie más la baile:",
    ]),
    viajes: q("Nuestros viajes", [
      "Nuestro primer viaje juntos:",
      "Lo más gracioso que nos pasó viajando:",
      "El viaje que todavía nos debemos:",
    ]),
    risas: q("Lo que nos hace reír", [
      "Un chiste interno que nadie entiende:",
      "La vez que no podíamos parar de reírnos:",
      "Lo más ridículo que hiciste por mí:",
    ]),
    dificiles: q("Los días difíciles", [
      "Un momento difícil que atravesamos juntos:",
      "¿Qué aprendimos de esa etapa?",
      "¿Qué hago yo que te ayuda cuando estás mal?",
    ]),
    preguntas: q(
      "Preguntas que nunca nos hicimos",
      [
        "¿Qué te da miedo y nunca me contaste?",
        "¿Qué sueño tenías de chico o chica que todavía te gustaría cumplir?",
        "¿En qué momento te sentiste más cerca de mí?",
        "¿Qué te gustaría que hiciera más seguido?",
        "¿Qué cosa de vos creés que todavía no conozco?",
        "¿Qué te enamora de nosotros hoy, que no te enamoraba al principio?",
      ],
      "Respondan por separado y después lean juntos.",
    ),
    rituales: q("Nuestros rituales", [
      "Nuestra mañana de domingo ideal:",
      "Una costumbre que inventamos:",
      "Cómo festejamos los aniversarios:",
    ]),
    admiro: q("Lo que admiro de vos", [
      "Tres cosas que amo de vos:",
      "Algo que me enseñaste sin darte cuenta:",
      "Un momento en que me sentí orgulloso u orgullosa de vos:",
    ]),
    hogar: q("Nuestro hogar", [
      "¿Qué hace que nuestra casa sea nuestra?",
      "El objeto más querido que tenemos:",
      "Cómo nos repartimos las cosas (y quién cocina mejor):",
    ]),
    futuro: q("Nuestro futuro", [
      "Dentro de cinco años nos imagino…",
      "Diez cosas que queremos hacer juntos:",
      "Cómo me imagino nuestra vejez:",
    ]),
    lista: q("Cosas por vivir juntos", [
      "Lugares que queremos conocer:",
      "Cosas que queremos aprender juntos:",
      "Locuras que nos debemos:",
    ]),
    capsula: letter("Cartas para abrir en el futuro", [
      "Una carta para abrir en nuestro próximo aniversario",
      "Una carta para abrir dentro de diez años",
    ]),
    fotos: photos("Fotografías", ["Nuestra primera foto juntos", "Un viaje", "Un día cualquiera", "Hoy"]),
    cartas: letter("Cartas de amor", ["Una carta para vos"]),
  };
}

/* Hijos: el padre o la madre registra la infancia del hijo ----------------- */

export function childhoodSections(chico: string) {
  return {
    dedicatoria: dedication("Escribí aquí para quién es este libro y por qué lo empezaste."),
    espera: q("Mientras te esperábamos", [
      "Cómo nos enteramos de que ibas a llegar:",
      "Lo que soñábamos para vos:",
      "Cómo elegimos tu nombre:",
      "Cómo preparamos la casa para recibirte:",
    ]),
    nacimiento: q("El día que llegaste", [
      "Fecha, hora, lugar y cómo estaba el clima:",
      "Quiénes estaban y quiénes se enteraron primero:",
      "Lo primero que pensé cuando te vi:",
    ]),
    primeros: q("Tus primeras veces", [
      "Tu primera sonrisa:",
      "Tu primera palabra:",
      "Tus primeros pasos:",
      "Tu primer día en el jardín:",
    ]),
    gustos: q("Lo que te gustaba", [
      "Tu juguete preferido:",
      "La canción que te calmaba:",
      "La comida que amabas y la que no querías ni ver:",
      "Tu cuento favorito para dormir:",
    ]),
    frases: q("Tus frases y ocurrencias", [
      "Palabras que inventaste:",
      "Algo que dijiste y nos hizo reír a todos:",
      "Preguntas tuyas que no supimos contestar:",
    ]),
    familia: q("Tu familia", [
      "Tus abuelos, tíos y primos:",
      "Lo que más te gustaba hacer con cada uno:",
      "Las tradiciones que hicimos con vos:",
    ]),
    cumples: q("Tus cumpleaños", [
      "Tu primer cumpleaños:",
      "El cumpleaños más especial:",
      "Los regalos que más te gustaron:",
    ]),
    crecer: q("Cómo fuiste creciendo", [
      `Cómo eras a los tres años:`,
      `Cómo eras a los cinco:`,
      `Lo que más me sorprendió de vos al crecer:`,
    ]),
    tusRecuerdos: q(
      "Tus primeros recuerdos",
      [
        "¿Qué es lo primero que te acordás?",
        "¿Qué lugar de la casa era tu favorito?",
        "¿Con quién te gustaba jugar?",
        "Dibujá aquí algo que te guste mucho.",
      ],
      `Esta parte la completa el ${chico} con ayuda, o la completa más adelante.`,
    ),
    deseos: letter("Lo que deseo para vos", ["Una carta para que leas cuando seas grande"]),
    medidas: q("Tu altura y tu mano", [
      "Tu altura en cada cumpleaños:",
      "Marcá aquí el contorno de tu mano:",
    ]),
    fotos: photos("Fotografías", [
      "Tu primera foto",
      "Con la familia",
      "Tu primer cumpleaños",
      "Una foto que me encanta",
    ]),
  };
}

/* Personales: la persona escribe su propia historia ------------------------ */

export function personalSections() {
  return {
    dedicatoria: dedication("¿Para quién escribís este libro? Puede ser para vos o para quienes amás."),
    hoy: q("Quién soy hoy", [
      "Hoy tengo … años y vivo en…",
      "Un día normal en mi vida es así:",
      "Tres cosas que me hacen ser quien soy:",
      "Lo que más me importa en este momento:",
    ]),
    raices: q("Mis raíces", [
      "Mi familia viene de…",
      "Lo que sé de mis abuelos es…",
      "Una historia familiar que escuché mil veces:",
    ]),
    infancia: q("Mi infancia", [
      "Lo primero que recuerdo es…",
      "La casa donde crecí era así:",
      "Mis juegos preferidos eran…",
      "Lo que me daba miedo y lo que me hacía feliz:",
    ]),
    familia: q("Mi familia", [
      "Mis padres eran (o son) así:",
      "Lo que heredé de ellos:",
      "Mis hermanos y yo:",
    ]),
    escuela: q("La escuela", [
      "Mi escuela, mis maestros y mis amigos:",
      "Lo que me encantaba aprender:",
      "Una anécdota del colegio:",
    ]),
    juventud: q("Mi juventud", [
      "A los quince yo era…",
      "La música, la ropa y los lugares de esos años:",
      "Lo que soñaba ser:",
      "La primera vez que me sentí libre:",
    ]),
    amores: q("Mis amores", [
      "Mi primer amor:",
      "La persona que más amé:",
      "Lo que aprendí del amor:",
    ]),
    trabajo: q("Mi trabajo y mi vocación", [
      "Mi primer trabajo:",
      "Lo que hago y por qué lo elegí (o cómo me eligió):",
      "Un logro del que estoy orgulloso u orgullosa:",
    ]),
    decisiones: q("Las decisiones que me cambiaron", [
      "La decisión más valiente que tomé:",
      "El momento en que mi vida pudo ir para otro lado:",
      "Lo que volvería a hacer igual:",
    ]),
    lugares: q("Mis lugares", [
      "El lugar donde me siento en casa:",
      "El mejor viaje de mi vida:",
      "Un lugar al que me gustaría volver:",
    ]),
    nuncaConte: q(
      "Las cosas que nunca conté",
      [
        "Algo que nunca le conté a nadie (y ahora sí):",
        "Un miedo que tuve en silencio:",
        "Una vez que hice algo que nadie se imagina:",
        "Algo que me hubiera gustado decir a tiempo:",
      ],
      "Este espacio es tuyo. Decidí vos quién lo va a leer.",
    ),
    aprendi: q("Lo que aprendí", [
      "Lo que sé hoy y me hubiera gustado saber antes:",
      "La lección que me costó más:",
      "Lo que aprendí a soltar:",
    ]),
    feliz: q("Lo que me hace feliz", [
      "Mis pequeños placeres:",
      "Las personas que me hacen bien:",
      "Un día perfecto para mí sería…",
    ]),
    conocerme: q("Para conocerme mejor", [
      "Tres palabras que me describen y tres que me gustaría que me describieran:",
      "Lo que me enoja, lo que me emociona, lo que me calma:",
      "Mis manías y mis rituales:",
      "Lo que estoy aprendiendo de mí este año:",
    ]),
    legado: q("Mi legado", [
      "Cómo me gustaría ser recordado o recordada:",
      "Los valores que quiero dejar:",
      "Los consejos que quiero que no se pierdan:",
      "Una receta, una canción o un saber que quiero heredar:",
    ]),
    cartas: letter("Cartas para quienes amo", [
      "Una carta para mi familia",
      "Una carta para alguien en especial",
    ]),
    futuro: letter("Una carta para mi yo del futuro", ["Para abrir dentro de diez años:"]),
    fotos: photos("Fotografías", [
      "Yo de chico o chica",
      "Mi juventud",
      "Las personas que amo",
      "Yo, hoy",
    ]),
  };
}

/* Amigos ------------------------------------------------------------------- */

export function friendSections() {
  return {
    dedicatoria: dedication("Escribí aquí por qué nuestra amistad merece un libro."),
    conocimos: q("Cómo nos conocimos", [
      "Dónde y cuándo nos conocimos:",
      "Lo primero que pensé de vos:",
      "El momento en que pasamos de conocidos a amigos:",
    ]),
    aventuras: q("Nuestras aventuras", [
      "La salida más épica:",
      "El viaje que no olvidamos:",
      "La vez que nos metimos en un lío:",
      "La noche que no terminaba nunca:",
    ]),
    lugares: q("Nuestros lugares", [
      "El lugar donde siempre nos juntamos:",
      "La comida que es nuestra:",
      "Las canciones que son de nosotros:",
    ]),
    chistes: q("Chistes internos", [
      "Palabras o apodos que solo entendemos nosotros:",
      "La anécdota que contamos siempre:",
      "Lo que nos hace reír sin decir nada:",
    ]),
    necesite: q("Cuando más te necesité", [
      "La vez que estuviste sin que te lo pidiera:",
      "Lo que me dijiste que nunca olvidé:",
      "Cómo me ayudaste a ser quien soy:",
    ]),
    admiro: q("Lo que admiro de vos", [
      "Tu mejor cualidad:",
      "Algo que aprendí de vos:",
      "Lo que te diría si no me diera vergüenza:",
    ]),
    pendientes: q("Lo que nos falta vivir", [
      "El viaje que nos debemos:",
      "Algo que queremos aprender juntos:",
      "Cómo nos imagino dentro de veinte años:",
    ]),
    preguntas: q("Preguntas que nunca nos hicimos", [
      "¿Qué pensaste de verdad la primera vez que me viste?",
      "¿Cuándo sentiste que podías contarme cualquier cosa?",
      "¿Qué cosa de mí te gustaría que no cambie nunca?",
    ]),
    fotos: photos("Fotografías", ["Nuestra primera foto", "Una aventura", "Una foto de hoy"]),
    cartas: letter("Una carta para vos", ["Gracias por…"]),
  };
}
