//const { getOnDemandLazySlides } = require("react-slick/lib/utils/innerSliderUtils") 

kaboom({
    global: true,
    fullscreen: true,
    scale: 2,
    debug: true,
    clearColor: [0, 0, 0, 1],
})                        // Fond et dimension ecran


const VITESSE_DEPLACEMENT = 120   // Vitesse de deplacement 
const JUMP_FORCE = 340            // hauteur du saut
const GROS_JUMP_FORCE = 560       // Hauteur du saut quand mon perso est gros
let CURRENT_JUMP_FORCE = JUMP_FORCE
let saut = true
const CHUTE_MORT = 400


loadRoot('https://i.imgur.com/')
loadSprite('coin', 'wbKxhcd.png')
loadSprite('champi_monstre', 'KPO3fR9.png')
loadSprite('mur_brique', 'pogC9x5.png')
loadSprite('fleur', 'uaUm9sN.png')
loadSprite('champi', '0wMd92p.png')
loadSprite('tuyau-top-gauche', 'ReTPiWY.png')
loadSprite('tuyau-top-right', 'hj2GK4n.png')
loadSprite('tuyau-bot-right', 'nqQ79eI.png')
loadSprite('tuyau-bot-gauche', 'c1cYSbt.png')
loadSprite('brique_pts_interogation', 'gesQ1KP.png')
loadSprite('brique', 'bdrLpi6.png')
loadSprite('perso', 'Wb1qfhK.png')
loadSprite('brique_bleu', '3e5YRQd.png')
loadSprite('block_bleu', 'fVscIbn.png')
loadSprite('acier_bleu', 'gqVoI2b.png')
loadSprite('champi_monstre_bleu', 'SvV4ueD.png')
loadSprite('brique_pts_interrogation_bleu', 'RMqCc1G.png')







scene("game", ({ level, score }) => {
    layers(['bg', 'obj', 'ui'], 'obj')

    // Gameboard
    const maps = [
        [
            '                                                      ',
            '                                                      ',                               ////////////////////////////////////////
            '                                                      ',                               ////////////// LEVEL 1 /////////////////
            '                                                      ',                               ////////////////////////////////////////
            '      % =*=%=                                         ',
            '                                                      ',
            '                                      -+              ',
            '                             ^     ^  ()              ',
            '========================================       =======',
        ],
        [
            '£                                                     £',
            '£                                                     £',
            '£                                          x          £',                                 ////////////////////////////////////////
            '£                                         xx          £',                                 ////////////// LEVEL 2 /////////////////
            '£     % =*=%=                            xxx          £',                                 ////////////////////////////////////////
            '£                                       xxxx          £',
            '£                                      xxxxx        -+£',
            '£                             z     z xxxxxx        ()£',
            '!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!',
        ]
    ]

    const levelConfig = {
        width: 20,
        height: 20,                 // Configure la taille des image importé a 20px X 20px
        '=': [sprite('mur_brique'), solid()],
        '$': [sprite('coin'), 'coin'],
        '%': [sprite('brique_pts_interogation'), solid(), 'coin-brique_pts_interogation'],
        '*': [sprite('brique_pts_interogation'), solid(), 'champi-brique_pts_interogation'],
        '}': [sprite('brique'), solid()],
        '(': [sprite('tuyau-bot-gauche'), solid(), scale(0.5)],
        ')': [sprite('tuyau-bot-right'), solid(), scale(0.5)],
        '-': [sprite('tuyau-top-gauche'), solid(), scale(0.5), 'pipe'],
        '+': [sprite('tuyau-top-right'), solid(), scale(0.5), 'pipe'],
        '^': [sprite('champi_monstre'), solid(), 'danger'],
        '#': [sprite('champi'), solid(), 'champi', body()],
        '!': [sprite('block_bleu'), solid(), scale(0.5)],
        '£': [sprite('brique_bleu'), solid(), scale(0.5)],
        'z': [sprite('champi_monstre_bleu'), solid(), scale(0.5), 'danger'],
        '@': [sprite('brique_pts_interrogation_bleu'), solid(), scale(0.5), 'coin-brique_pts_interrogation_bleu'],
        'x': [sprite('acier_bleu'), solid(), scale(0.5)],






    } // Utiliser le solid pour faire comprendre au perso que le bloc le stop car il est solide (magique)

    const gameLevel = addLevel(maps[level], levelConfig)

    const scoreLabel = add([ // Ajoute un text pour donner le nom du niveau 
        text(score),
        pos(30, 6),
        layer('ui'),
        {
            value: score,
        }
    ])

    add([text('level' + parseInt(level + 1)), pos(40.6)]) // Donne une valeur au text et sa position

    function big() {  // Fonction qui fait grossir le mario
        let timer = 0
        let isBig = false
        return {
            update() {
                if (isBig) {

                    timer -= dt()        // Fonction kaboom qui permet de recuperer la difference de temp avec la derniere image         

                    if (timer <= 0) {
                        this.smallify()      // Si on passse a travers un element alors applique toute la fonction
                    }
                }
            },
            isBig() {
                return isBig
            },
            smallify(time) {
                CURRENT_JUMP_FORCE = JUMP_FORCE    // Affecte la valeur de saut la plus faible car le perso est petit
                this.scale = vec2(1, 1)
                timer = 0                          //Rend plus petit
                isBig = false
            },
            biggify(time) {
                CURRENT_JUMP_FORCE = GROS_JUMP_FORCE // Affecte la valeur de saut la plus haute
                this.scale = vec2(2)
                timer = time                      // Rend plus grand
                isBig = true
            }
        }
    }

    action('champi', (m) => {
        m.move(40, 0)                             // Deplacement champi
    })

    const perso = add([
        sprite('perso'), solid(),
        pos(30, 0),  //Position initiale du personnage
        body(),   //Gravité ce qui le fait apparaitre
        big(),
        origin('bot'),
    ])

    perso.on("headbump", (obj) => {
        if (obj.is('coin-brique_pts_interogation')) {    //Quand on met un coup de tete fait apparaitre une piece
            gameLevel.spawn('$', obj.gridPos.sub(0, 1))  // Fait spawn la piece , donne une position sur la grid
            destroy(obj)                                // Detruit le block une fois qu'elle a spawn
            gameLevel.spawn('}', obj.gridPos.sub(0, 0))   // fait apparaitre un block en dur genre la brique
        }
        if (obj.is('champi-brique_pts_interogation')) {
            gameLevel.spawn('#', obj.gridPos.sub(0, 1))          //Pareil qu'au dessus mais avec un champiiiiiiiii
            destroy(obj)
            gameLevel.spawn('}', obj.gridPos.sub(0, 0))
        }
    })


    perso.collides('champi', (m) => {       // (m) == champi
        destroy(m)
        perso.biggify(6)
    })

    perso.collides('coin', (c) => {          //(c) == coin
        destroy(c)
        scoreLabel.value++
        scoreLabel.text = scoreLabel.value
    })

    perso.collides('danger', (d) => {
        if (saut) {
            destroy(d)              // Si il y a eu collision alors qu'on sauté , detruit l'ellement danger 
        } else {
            go('lose', { score: scoreLabel.value })   // Si il y a eu collision envoie vers le tableau des scores 
        }
    })

    perso.action(() => {
        camPos(perso.pos)           // Position de la camera sur le personnage
        if (perso.pos.y >= CHUTE_MORT) {  // Si la chute est superieur ou egale a chute_mort (400)
            go('lose', { score: scoreLabel.value })  // Alors on perd et on retourne sur la page loose avec le score
        }
    })

    perso.collides('pipe', () => {
        keyPress('down', () => {                                     // Lorsqu'on appuie sur sur la fleche du bas nous fait rentrer dans le tuyau
            go('game', {
                level: (level + 1) % maps.length,                    // Nous envoie sur la prochaine map
                score: scoreLabel.value
            })
        })
    })

    const ENEMY_SPEED = 20

    action('danger', (d) => {
        d.move(-ENEMY_SPEED, 0)   // Mouvement de l'enemi
    })
    keyDown('left', () => {
        perso.move(-VITESSE_DEPLACEMENT, 0)    // Fait bouger le perso vers la gauche
    })
    keyDown('right', () => {
        perso.move(VITESSE_DEPLACEMENT, 0)    // Fait bouger le perso vers la droite
    })

    perso.action(() => {
        if (perso.grounded()) {
            saut = false
        }
    })


    keyPress('space', () => {
        if (perso.grounded()) {
            saut = true
            perso.jump(CURRENT_JUMP_FORCE)  // Fait sauter le perso
        }
    })
})
scene('lose', ({ score }) => {
    add([text(score, 32), origin('center'), pos(width() / 2, height() / 2)])  // Si on a perdu , affiche un texte lose au milieu de la page
})
start("game", { level: 0, score: 0 })