/* ═══════════════════════════════════════════════════════════ */
/* Three.js 3D RACING SIMULATION — KART RP                   */
/* Complex circuit + realistic kart models                    */
/* ═══════════════════════════════════════════════════════════ */

import * as THREE from 'three';

export function initTrack3D(canvas) {
    // ── Scene Setup ──
    const scene = new THREE.Scene();
    scene.background = new THREE.Color(0x050508);
    scene.fog = new THREE.FogExp2(0x050508, 0.004);

    const container = canvas.parentElement;
    let width = container.clientWidth;
    let height = container.clientHeight;

    const camera = new THREE.PerspectiveCamera(65, width / height, 0.1, 1000);
    camera.position.set(0, 45, 50);

    const renderer = new THREE.WebGLRenderer({ canvas, antialias: true, alpha: true });
    renderer.setSize(width, height);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    renderer.shadowMap.enabled = true;
    renderer.shadowMap.type = THREE.PCFSoftShadowMap;
    renderer.toneMapping = THREE.ACESFilmicToneMapping;
    renderer.toneMappingExposure = 1.3;

    // ── Lights ──
    const ambientLight = new THREE.AmbientLight(0x1a1a2e, 1.0);
    scene.add(ambientLight);

    const dirLight = new THREE.DirectionalLight(0xffeedd, 0.5);
    dirLight.position.set(40, 80, 30);
    dirLight.castShadow = true;
    dirLight.shadow.mapSize.width = 2048;
    dirLight.shadow.mapSize.height = 2048;
    dirLight.shadow.camera.near = 0.5;
    dirLight.shadow.camera.far = 200;
    dirLight.shadow.camera.left = -80;
    dirLight.shadow.camera.right = 80;
    dirLight.shadow.camera.top = 80;
    dirLight.shadow.camera.bottom = -80;
    scene.add(dirLight);

    // Moonlight
    const moonLight = new THREE.DirectionalLight(0x4444ff, 0.12);
    moonLight.position.set(-30, 80, -30);
    scene.add(moonLight);

    // Red accent lights
    const redLights = [];
    const rlPositions = [
        [-30, 4, -20], [25, 4, -30], [35, 4, 5], [15, 4, 25],
        [-15, 4, 30], [-35, 4, 10], [-25, 4, -15], [5, 4, -35],
        [30, 4, -15], [-10, 4, -25], [20, 4, 15], [-20, 4, 20],
    ];
    rlPositions.forEach(pos => {
        const rl = new THREE.PointLight(0xe60012, 1.2, 20);
        rl.position.set(...pos);
        scene.add(rl);
        redLights.push(rl);
    });

    // ── Stars ──
    const starsGeo = new THREE.BufferGeometry();
    const starPos = [];
    for (let i = 0; i < 1000; i++) {
        starPos.push(
            (Math.random() - 0.5) * 500,
            Math.random() * 180 + 25,
            (Math.random() - 0.5) * 500
        );
    }
    starsGeo.setAttribute('position', new THREE.Float32BufferAttribute(starPos, 3));
    scene.add(new THREE.Points(starsGeo, new THREE.PointsMaterial({ color: 0xffffff, size: 0.3, transparent: true, opacity: 0.5 })));

    // ── Ground ──
    const groundGeo = new THREE.PlaneGeometry(300, 300, 1, 1);
    const groundMat = new THREE.MeshStandardMaterial({ color: 0x0a0f0a, roughness: 0.95, metalness: 0.05 });
    const ground = new THREE.Mesh(groundGeo, groundMat);
    ground.rotation.x = -Math.PI / 2;
    ground.position.y = -0.5;
    ground.receiveShadow = true;
    scene.add(ground);

    // Green grass areas
    for (let i = 0; i < 60; i++) {
        const angle = Math.random() * Math.PI * 2;
        const radius = 15 + Math.random() * 50;
        const sz = 1.5 + Math.random() * 4;
        const pGeo = new THREE.CircleGeometry(sz, 6);
        const pMat = new THREE.MeshStandardMaterial({ color: 0x0a1a08, roughness: 0.9 });
        const p = new THREE.Mesh(pGeo, pMat);
        p.rotation.x = -Math.PI / 2;
        p.position.set(Math.cos(angle) * radius, -0.45, Math.sin(angle) * radius);
        scene.add(p);
    }

    // ══════════════════════════════════════════════════════════
    // COMPLEX TRACK LAYOUT — Inspired by multi-curve real kartódromo
    // Multiple S-bends, hairpins, sweeping curves, chicanes
    // ══════════════════════════════════════════════════════════
    const trackPoints = [
        // Start / Finish Straight
        new THREE.Vector3(-35, 0, -2),
        new THREE.Vector3(-28, 0, -3),
        // First S-bend (right-left)
        new THREE.Vector3(-22, 0.5, -8),
        new THREE.Vector3(-16, 1.0, -15),
        new THREE.Vector3(-8, 1.5, -20),
        // Wide right sweeper
        new THREE.Vector3(0, 2.0, -24),
        new THREE.Vector3(10, 2.5, -25),
        new THREE.Vector3(18, 3.0, -22),
        // Sharp hairpin right
        new THREE.Vector3(24, 3.5, -16),
        new THREE.Vector3(26, 3.2, -8),
        new THREE.Vector3(24, 2.8, -1),
        // Chicane sequence
        new THREE.Vector3(20, 2.5, 4),
        new THREE.Vector3(15, 2.0, 2),
        new THREE.Vector3(10, 1.8, 5),
        new THREE.Vector3(8, 2.0, 10),
        // Inner loop (tight technical section)
        new THREE.Vector3(12, 2.5, 15),
        new THREE.Vector3(18, 3.0, 18),
        new THREE.Vector3(22, 3.5, 22),
        // Sweeping left turn
        new THREE.Vector3(20, 3.2, 28),
        new THREE.Vector3(14, 2.8, 32),
        new THREE.Vector3(6, 2.5, 33),
        // Second S-bend
        new THREE.Vector3(-2, 2.0, 30),
        new THREE.Vector3(-8, 1.5, 25),
        new THREE.Vector3(-14, 1.0, 22),
        // Back straight with kink
        new THREE.Vector3(-20, 0.8, 18),
        new THREE.Vector3(-26, 0.5, 14),
        new THREE.Vector3(-32, 0.3, 10),
        // Final hairpin left
        new THREE.Vector3(-36, 0.5, 5),
        new THREE.Vector3(-38, 0.3, 0),
        new THREE.Vector3(-37, 0, -2),
    ];

    const trackCurve = new THREE.CatmullRomCurve3(trackPoints, true, 'centripetal', 0.4);

    // ── Track Surface (flat ribbon) ──
    const trackWidth = 4.5;
    const trackSegments = 600;
    const tVerts = [], tUvs = [], tIdx = [];

    for (let i = 0; i <= trackSegments; i++) {
        const t = i / trackSegments;
        const pt = trackCurve.getPoint(t);
        const tan = trackCurve.getTangent(t).normalize();
        const norm = new THREE.Vector3(-tan.z, 0, tan.x).normalize();
        const L = pt.clone().add(norm.clone().multiplyScalar(trackWidth / 2));
        const R = pt.clone().add(norm.clone().multiplyScalar(-trackWidth / 2));
        L.y = pt.y + 0.01; R.y = pt.y + 0.01;
        tVerts.push(L.x, L.y, L.z, R.x, R.y, R.z);
        tUvs.push(0, t * 40, 1, t * 40);
        if (i < trackSegments) {
            const a = i * 2, b = a + 1, c = a + 2, d = a + 3;
            tIdx.push(a, c, b, b, c, d);
        }
    }
    const trackGeo = new THREE.BufferGeometry();
    trackGeo.setAttribute('position', new THREE.Float32BufferAttribute(tVerts, 3));
    trackGeo.setAttribute('uv', new THREE.Float32BufferAttribute(tUvs, 2));
    trackGeo.setIndex(tIdx);
    trackGeo.computeVertexNormals();
    const trackMat = new THREE.MeshStandardMaterial({ color: 0x1e1e1e, roughness: 0.55, metalness: 0.15 });
    const trackMesh = new THREE.Mesh(trackGeo, trackMat);
    trackMesh.receiveShadow = true;
    scene.add(trackMesh);

    // ── Center dashed line ──
    const clPts = trackCurve.getPoints(600);
    const clGeo = new THREE.BufferGeometry().setFromPoints(clPts);
    const clMat = new THREE.LineDashedMaterial({ color: 0xffffff, dashSize: 0.8, gapSize: 0.8, transparent: true, opacity: 0.35 });
    const cl = new THREE.Line(clGeo, clMat);
    cl.computeLineDistances();
    cl.position.y = 0.04;
    scene.add(cl);

    // ── Edge lines ──
    function edgeLine(offset, col, opa) {
        const pts = [];
        for (let i = 0; i <= 600; i++) {
            const t = i / 600;
            const p = trackCurve.getPoint(t);
            const tan = trackCurve.getTangent(t).normalize();
            const n = new THREE.Vector3(-tan.z, 0, tan.x).normalize();
            pts.push(new THREE.Vector3(p.x + n.x * offset, p.y + 0.04, p.z + n.z * offset));
        }
        const g = new THREE.BufferGeometry().setFromPoints(pts);
        scene.add(new THREE.Line(g, new THREE.LineBasicMaterial({ color: col, transparent: true, opacity: opa })));
    }
    edgeLine(trackWidth / 2, 0xffffff, 0.5);
    edgeLine(-trackWidth / 2, 0xffffff, 0.5);

    // ── Colored curb barriers (red/white stripes emulated with segments) ──
    function createCurb(offset, color1, color2) {
        const segCount = 300;
        for (let i = 0; i < segCount; i++) {
            const t1 = i / segCount;
            const t2 = (i + 1) / segCount;
            const p1 = trackCurve.getPoint(t1);
            const p2 = trackCurve.getPoint(t2);
            const tan1 = trackCurve.getTangent(t1).normalize();
            const n1 = new THREE.Vector3(-tan1.z, 0, tan1.x).normalize();

            const x = p1.x + n1.x * offset;
            const z = p1.z + n1.z * offset;

            if (i % 6 < 3) {
                const sGeo = new THREE.SphereGeometry(0.12, 4, 4);
                const sMat = new THREE.MeshBasicMaterial({ color: color1, transparent: true, opacity: 0.6 });
                const s = new THREE.Mesh(sGeo, sMat);
                s.position.set(x, p1.y + 0.15, z);
                scene.add(s);
            }
        }
    }
    createCurb(trackWidth / 2 + 0.3, 0xe60012, 0xffffff);
    createCurb(-trackWidth / 2 - 0.3, 0xe60012, 0xffffff);

    // ── Neon barrier tubes ──
    function barrierTube(offset, color) {
        const pts = [];
        for (let i = 0; i <= 300; i++) {
            const t = i / 300;
            const p = trackCurve.getPoint(t);
            const tan = trackCurve.getTangent(t).normalize();
            const n = new THREE.Vector3(-tan.z, 0, tan.x).normalize();
            pts.push(new THREE.Vector3(p.x + n.x * offset, p.y + 0.1, p.z + n.z * offset));
        }
        const curve = new THREE.CatmullRomCurve3(pts, true);
        const geo = new THREE.TubeGeometry(curve, 300, 0.08, 4, true);
        const mat = new THREE.MeshStandardMaterial({
            color, roughness: 0.3, metalness: 0.6,
            emissive: color, emissiveIntensity: 0.2
        });
        scene.add(new THREE.Mesh(geo, mat));
    }
    barrierTube(trackWidth / 2 + 0.5, 0xe60012);
    barrierTube(-trackWidth / 2 - 0.5, 0xe60012);

    // ── Central Dome (inspired by reference image) ──
    // Large dome structure
    const domeGeo = new THREE.SphereGeometry(8, 32, 16, 0, Math.PI * 2, 0, Math.PI / 2);
    const domeMat = new THREE.MeshStandardMaterial({
        color: 0x2a2a2a, roughness: 0.2, metalness: 0.8,
        transparent: true, opacity: 0.7
    });
    const dome = new THREE.Mesh(domeGeo, domeMat);
    dome.position.set(0, 0, 5);
    dome.receiveShadow = true;
    scene.add(dome);

    // Dome base ring
    const domeRingGeo = new THREE.TorusGeometry(8, 0.2, 8, 48);
    const domeRingMat = new THREE.MeshBasicMaterial({ color: 0xe60012, transparent: true, opacity: 0.7 });
    const domeRing = new THREE.Mesh(domeRingGeo, domeRingMat);
    domeRing.position.set(0, 0.2, 5);
    domeRing.rotation.x = Math.PI / 2;
    scene.add(domeRing);

    // Dome top antenna
    const antGeo = new THREE.CylinderGeometry(0.08, 0.12, 4, 4);
    const antMat = new THREE.MeshStandardMaterial({ color: 0x444444, metalness: 0.9 });
    const ant = new THREE.Mesh(antGeo, antMat);
    ant.position.set(0, 10, 5);
    scene.add(ant);

    // Dome beacon light
    const domeLight = new THREE.PointLight(0xe60012, 4, 40);
    domeLight.position.set(0, 12, 5);
    scene.add(domeLight);

    // Dome interior warm glow
    const domeWarm = new THREE.PointLight(0xffaa44, 2, 20);
    domeWarm.position.set(0, 4, 5);
    scene.add(domeWarm);

    // Dome windows (glowing ring band)
    const winGeo = new THREE.TorusGeometry(7.5, 0.5, 4, 48);
    const winMat = new THREE.MeshStandardMaterial({
        color: 0x88ccff, roughness: 0.1, metalness: 0.8,
        transparent: true, opacity: 0.25,
        emissive: 0x224466, emissiveIntensity: 0.5
    });
    const winRing = new THREE.Mesh(winGeo, winMat);
    winRing.position.set(0, 3, 5);
    winRing.rotation.x = Math.PI / 2;
    scene.add(winRing);

    // ── Track Lights (40 floodlight poles) ──
    for (let i = 0; i < 40; i++) {
        const t = i / 40;
        const pt = trackCurve.getPoint(t);
        const tan = trackCurve.getTangent(t).normalize();
        const norm = new THREE.Vector3(-tan.z, 0, tan.x).normalize();
        const side = i % 2 === 0 ? 1 : -1;
        const px = pt.x + norm.x * (trackWidth / 2 + 2.5) * side;
        const pz = pt.z + norm.z * (trackWidth / 2 + 2.5) * side;

        // Pole
        const poleGeo = new THREE.CylinderGeometry(0.05, 0.07, 4.5, 4);
        const pole = new THREE.Mesh(poleGeo, new THREE.MeshStandardMaterial({ color: 0x333333, metalness: 0.9, roughness: 0.3 }));
        pole.position.set(px, 2.25 + pt.y, pz);
        pole.castShadow = true;
        scene.add(pole);

        // Bulb
        const isRed = i % 4 === 0;
        const bulbGeo = new THREE.SphereGeometry(0.1, 6, 6);
        const bulb = new THREE.Mesh(bulbGeo, new THREE.MeshBasicMaterial({
            color: isRed ? 0xe60012 : 0xffeedd, transparent: true, opacity: 0.9
        }));
        bulb.position.set(px, 4.6 + pt.y, pz);
        scene.add(bulb);

        if (i % 5 === 0) {
            const pl = new THREE.PointLight(isRed ? 0xe60012 : 0xffeedd, 0.6, 10);
            pl.position.set(px, 4.7 + pt.y, pz);
            scene.add(pl);
        }
    }

    // ── Start/Finish line ──
    const slPt = trackCurve.getPoint(0);
    const slTan = trackCurve.getTangent(0).normalize();
    const checkerCanvas = document.createElement('canvas');
    checkerCanvas.width = 64; checkerCanvas.height = 64;
    const cCtx = checkerCanvas.getContext('2d');
    for (let x = 0; x < 8; x++) for (let y = 0; y < 8; y++) {
        cCtx.fillStyle = (x + y) % 2 === 0 ? '#ffffff' : '#111111';
        cCtx.fillRect(x * 8, y * 8, 8, 8);
    }
    const checkerTex = new THREE.CanvasTexture(checkerCanvas);
    const slGeo = new THREE.PlaneGeometry(trackWidth, 1.2);
    const slMesh = new THREE.Mesh(slGeo, new THREE.MeshBasicMaterial({ map: checkerTex, transparent: true, opacity: 0.85, side: THREE.DoubleSide }));
    slMesh.position.set(slPt.x, slPt.y + 0.06, slPt.z);
    slMesh.rotation.x = -Math.PI / 2;
    slMesh.rotation.z = Math.atan2(slTan.x, slTan.z);
    scene.add(slMesh);

    // ── Grandstands ──
    const gsData = [
        { x: -10, z: -28, rot: 0.2, len: 14 },
        { x: 30, z: -10, rot: 1.5, len: 10 },
        { x: 10, z: 35, rot: 3.2, len: 16 },
        { x: -30, z: 15, rot: 4.8, len: 10 },
    ];
    gsData.forEach(gs => {
        const g = new THREE.Group();
        for (let r = 0; r < 4; r++) {
            const sGeo = new THREE.BoxGeometry(gs.len, 0.25, 1);
            const sMat = new THREE.MeshStandardMaterial({ color: r % 2 === 0 ? 0x1a1a1a : 0x222222, roughness: 0.5, metalness: 0.4 });
            const s = new THREE.Mesh(sGeo, sMat);
            s.position.set(0, r * 0.7, r * 1);
            s.castShadow = true;
            g.add(s);
        }
        g.position.set(gs.x, 0, gs.z);
        g.rotation.y = gs.rot;
        scene.add(g);
    });

    // Grid
    const grid = new THREE.GridHelper(150, 75, 0x0d0d12, 0x0a0a0e);
    grid.position.y = -0.48;
    scene.add(grid);

    // ══════════════════════════════════════════════════════════
    // REALISTIC KART MODEL
    // ══════════════════════════════════════════════════════════
    function createKart(color, isPlayer) {
        const g = new THREE.Group();

        // ── Low-profile chassis (flat base plate) ──
        const chassisGeo = new THREE.BoxGeometry(0.75, 0.06, 1.6);
        const chassisMat = new THREE.MeshStandardMaterial({ color: 0x111111, roughness: 0.4, metalness: 0.6 });
        const chassis = new THREE.Mesh(chassisGeo, chassisMat);
        chassis.position.y = 0.12;
        chassis.castShadow = true;
        g.add(chassis);

        // ── Frame rails (tubular frame visible on sides) ──
        const railMat = new THREE.MeshStandardMaterial({ color: 0x333333, roughness: 0.3, metalness: 0.8 });
        // Left rail
        const lrGeo = new THREE.CylinderGeometry(0.025, 0.025, 1.5, 6);
        const lr = new THREE.Mesh(lrGeo, railMat);
        lr.rotation.x = Math.PI / 2;
        lr.position.set(-0.32, 0.18, 0);
        g.add(lr);
        // Right rail
        const rr = lr.clone();
        rr.position.set(0.32, 0.18, 0);
        g.add(rr);
        // Cross members
        for (let cz = -0.4; cz <= 0.4; cz += 0.4) {
            const cmGeo = new THREE.CylinderGeometry(0.02, 0.02, 0.64, 4);
            const cm = new THREE.Mesh(cmGeo, railMat);
            cm.rotation.z = Math.PI / 2;
            cm.position.set(0, 0.18, cz);
            g.add(cm);
        }

        // ── Front bumper (curved) ──
        const bmpGeo = new THREE.TorusGeometry(0.35, 0.025, 6, 12, Math.PI);
        const bmpMat = new THREE.MeshStandardMaterial({ color: 0x222222, roughness: 0.4, metalness: 0.6 });
        const bmp = new THREE.Mesh(bmpGeo, bmpMat);
        bmp.rotation.y = Math.PI;
        bmp.rotation.x = Math.PI / 2;
        bmp.position.set(0, 0.15, 0.82);
        g.add(bmp);

        // ── Rear bumper ──
        const rbmpGeo = new THREE.TorusGeometry(0.3, 0.02, 6, 10, Math.PI);
        const rbmp = new THREE.Mesh(rbmpGeo, bmpMat);
        rbmp.rotation.x = Math.PI / 2;
        rbmp.position.set(0, 0.15, -0.78);
        g.add(rbmp);

        // ── Side pods (fuel tank / body panels) ──
        const podMat = new THREE.MeshStandardMaterial({
            color, roughness: 0.25, metalness: 0.5,
            emissive: color, emissiveIntensity: isPlayer ? 0.12 : 0.03
        });
        [-1, 1].forEach(side => {
            const podGeo = new THREE.BoxGeometry(0.18, 0.12, 0.65);
            const pod = new THREE.Mesh(podGeo, podMat);
            pod.position.set(side * 0.35, 0.21, 0.05);
            g.add(pod);
        });

        // ── Nose cone (front fairing) ──
        const noseGeo = new THREE.BoxGeometry(0.5, 0.08, 0.4);
        const nose = new THREE.Mesh(noseGeo, podMat);
        nose.position.set(0, 0.17, 0.65);
        g.add(nose);

        // ── Floor tray ──
        const trayGeo = new THREE.BoxGeometry(0.6, 0.02, 0.5);
        const trayMat = new THREE.MeshStandardMaterial({ color: 0x0a0a0a, roughness: 0.7, metalness: 0.3 });
        const tray = new THREE.Mesh(trayGeo, trayMat);
        tray.position.set(0, 0.09, 0.15);
        g.add(tray);

        // ── WHEELS (4) — proper go-kart proportions ──
        const wheelMat = new THREE.MeshStandardMaterial({ color: 0x111111, roughness: 0.6, metalness: 0.4 });
        const hubMat = new THREE.MeshStandardMaterial({ color: 0x888888, roughness: 0.2, metalness: 0.8 });

        const wheels = [
            { x: -0.42, z: 0.55, r: 0.09, w: 0.07 },  // Front-left (smaller)
            { x: 0.42, z: 0.55, r: 0.09, w: 0.07 },   // Front-right
            { x: -0.44, z: -0.55, r: 0.12, w: 0.1 },   // Rear-left (bigger)
            { x: 0.44, z: -0.55, r: 0.12, w: 0.1 },    // Rear-right
        ];

        wheels.forEach(wh => {
            // Tire
            const tireGeo = new THREE.CylinderGeometry(wh.r, wh.r, wh.w, 14);
            const tire = new THREE.Mesh(tireGeo, wheelMat);
            tire.rotation.z = Math.PI / 2;
            tire.position.set(wh.x, wh.r + 0.04, wh.z);
            tire.castShadow = true;
            g.add(tire);

            // Hub
            const hubGeo = new THREE.CylinderGeometry(wh.r * 0.5, wh.r * 0.5, wh.w + 0.01, 8);
            const hub = new THREE.Mesh(hubGeo, hubMat);
            hub.rotation.z = Math.PI / 2;
            hub.position.set(wh.x, wh.r + 0.04, wh.z);
            g.add(hub);
        });

        // ── Rear axle ──
        const axleGeo = new THREE.CylinderGeometry(0.015, 0.015, 0.95, 6);
        const axle = new THREE.Mesh(axleGeo, railMat);
        axle.rotation.z = Math.PI / 2;
        axle.position.set(0, 0.16, -0.55);
        g.add(axle);

        // ── Engine block (rear) ──
        const engGeo = new THREE.BoxGeometry(0.22, 0.16, 0.2);
        const engMat = new THREE.MeshStandardMaterial({ color: 0x1a1a1a, roughness: 0.4, metalness: 0.7 });
        const eng = new THREE.Mesh(engGeo, engMat);
        eng.position.set(0.15, 0.24, -0.52);
        g.add(eng);

        // Engine exhaust pipe
        const exhGeo = new THREE.CylinderGeometry(0.025, 0.03, 0.18, 6);
        const exhMat = new THREE.MeshStandardMaterial({ color: 0x444444, roughness: 0.3, metalness: 0.9 });
        const exh = new THREE.Mesh(exhGeo, exhMat);
        exh.rotation.x = Math.PI / 4;
        exh.position.set(0.3, 0.3, -0.65);
        g.add(exh);

        // ── Seat ──
        const seatGeo = new THREE.BoxGeometry(0.3, 0.2, 0.35);
        const seatMat = new THREE.MeshStandardMaterial({ color: 0x111111, roughness: 0.7, metalness: 0.2 });
        const seat = new THREE.Mesh(seatGeo, seatMat);
        seat.position.set(0, 0.25, -0.1);
        g.add(seat);

        // Seat back
        const seatBackGeo = new THREE.BoxGeometry(0.28, 0.22, 0.05);
        const seatBack = new THREE.Mesh(seatBackGeo, seatMat);
        seatBack.position.set(0, 0.38, -0.28);
        seatBack.rotation.x = -0.15;
        g.add(seatBack);

        // ── Steering column + wheel ──
        const colGeo = new THREE.CylinderGeometry(0.012, 0.012, 0.25, 4);
        const col = new THREE.Mesh(colGeo, railMat);
        col.rotation.x = -Math.PI / 5;
        col.position.set(0, 0.33, 0.28);
        g.add(col);

        const swGeo = new THREE.TorusGeometry(0.08, 0.012, 6, 16);
        const steer = new THREE.Mesh(swGeo, new THREE.MeshStandardMaterial({ color: 0x222222, metalness: 0.5 }));
        steer.position.set(0, 0.4, 0.33);
        steer.rotation.x = Math.PI / 3.5;
        g.add(steer);

        // ── Driver ──
        // Torso (racing suit)
        const torsoGeo = new THREE.BoxGeometry(0.24, 0.28, 0.18);
        const torsoMat = new THREE.MeshStandardMaterial({ color: 0x181818, roughness: 0.6 });
        const torso = new THREE.Mesh(torsoGeo, torsoMat);
        torso.position.set(0, 0.52, -0.05);
        g.add(torso);

        // Arms
        [-1, 1].forEach(side => {
            const armGeo = new THREE.CylinderGeometry(0.03, 0.025, 0.22, 5);
            const arm = new THREE.Mesh(armGeo, torsoMat);
            arm.rotation.z = side * 0.5;
            arm.rotation.x = -0.6;
            arm.position.set(side * 0.16, 0.5, 0.1);
            g.add(arm);
        });

        // Helmet (proper racing helmet shape)
        const helmetGeo = new THREE.SphereGeometry(0.11, 12, 10);
        const helmetMat = new THREE.MeshStandardMaterial({ color, roughness: 0.15, metalness: 0.7 });
        const helmet = new THREE.Mesh(helmetGeo, helmetMat);
        helmet.position.set(0, 0.73, -0.04);
        helmet.scale.set(1, 0.95, 1.1);
        g.add(helmet);

        // Visor (dark reflective)
        const visorGeo = new THREE.SphereGeometry(0.1, 10, 5, 0, Math.PI * 2, 0, Math.PI / 3);
        const visorMat = new THREE.MeshStandardMaterial({
            color: 0x111111, roughness: 0.05, metalness: 0.95,
            transparent: true, opacity: 0.8
        });
        const visor = new THREE.Mesh(visorGeo, visorMat);
        visor.position.set(0, 0.72, -0.02);
        visor.rotation.x = Math.PI / 1.8;
        visor.scale.set(1, 0.9, 0.9);
        g.add(visor);

        // ── Number plate (player only) ──
        if (isPlayer) {
            const npCanvas = document.createElement('canvas');
            npCanvas.width = 64; npCanvas.height = 32;
            const nCtx = npCanvas.getContext('2d');
            nCtx.fillStyle = '#ffffff';
            nCtx.fillRect(0, 0, 64, 32);
            nCtx.fillStyle = '#e60012';
            nCtx.font = 'bold 22px Arial';
            nCtx.textAlign = 'center';
            nCtx.fillText('07', 32, 24);
            const npTex = new THREE.CanvasTexture(npCanvas);

            [-1, 1].forEach(side => {
                const npGeo = new THREE.PlaneGeometry(0.22, 0.11);
                const npMat = new THREE.MeshBasicMaterial({ map: npTex, side: THREE.DoubleSide });
                const np = new THREE.Mesh(npGeo, npMat);
                np.position.set(side * 0.38, 0.22, 0.05);
                np.rotation.y = side * Math.PI / 2;
                g.add(np);
            });

            // Subtle red glow aura
            const glGeo = new THREE.SphereGeometry(0.8, 8, 8);
            const glMat = new THREE.MeshBasicMaterial({ color: 0xe60012, transparent: true, opacity: 0.05 });
            const gl = new THREE.Mesh(glGeo, glMat);
            gl.position.y = 0.3;
            g.add(gl);
        }

        // ── Tail lights ──
        [-0.2, 0.2].forEach(x => {
            const tlGeo = new THREE.BoxGeometry(0.06, 0.03, 0.03);
            const tlMat = new THREE.MeshBasicMaterial({ color: 0xff0000, transparent: true, opacity: 0.8 });
            const tl = new THREE.Mesh(tlGeo, tlMat);
            tl.position.set(x, 0.17, -0.82);
            g.add(tl);
        });

        return g;
    }

    // ── Create karts ──
    const kartColors = [0xe60012, 0x0055dd, 0x00bb55, 0xff8800, 0xaa00ee, 0xdddd00, 0x00cccc, 0xff4488];
    const karts = [];
    const numKarts = 8;

    for (let i = 0; i < numKarts; i++) {
        const isPlayer = i === 0;
        const kartMesh = createKart(kartColors[i], isPlayer);
        scene.add(kartMesh);

        const baseSpeed = 0.0006;
        const variation = (Math.random() - 0.5) * 0.00015;

        karts.push({
            mesh: kartMesh,
            t: i * (1 / numKarts) + Math.random() * 0.02,
            speed: isPlayer ? baseSpeed + 0.0001 : baseSpeed + variation,
            isPlayer,
            prevT: 0,
            speedKmh: 0,
            lapCount: 0,
            bestLap: Infinity,
            currentLapStart: performance.now(),
        });
    }

    // ══════════════════════════════════════════════════════════
    // CAMERA SYSTEM
    // ══════════════════════════════════════════════════════════
    const CAMERAS = {
        CHASE: 'chase',
        ONBOARD: 'onboard',
        AERIAL: 'aerial',
        MIRANTE: 'mirante',
        CINEMATIC: 'cinematic',
        TRACKSIDE: 'trackside',
    };

    let currentCamera = CAMERAS.CHASE;
    let cinematicAngle = 0;
    let tracksideT = 0.25;

    // ── DOM HUD ──
    const hud = document.createElement('div');
    hud.id = 'race-hud';
    hud.innerHTML = `
    <div class="hud-top-bar">
      <div class="hud-live"><span class="hud-live-dot"></span> LIVE</div>
      <div class="hud-race-info">CORRIDA #247 — LAP <span id="hud-lap">1</span>/15</div>
      <div class="hud-cam-name" id="hud-cam-label">CHASE CAM</div>
    </div>
    <div class="hud-bottom">
      <div class="hud-driver">
        <div class="hud-driver-name">PEDRO SILVA</div>
        <div class="hud-driver-kart">KART #07</div>
      </div>
      <div class="hud-telemetry">
        <div class="hud-speed">
          <div class="hud-speed-value" id="hud-speed">0</div>
          <div class="hud-speed-unit">KM/H</div>
        </div>
        <div class="hud-data-col">
          <div class="hud-data-row"><span>POS</span><strong id="hud-pos">P2</strong></div>
          <div class="hud-data-row"><span>BEST</span><strong id="hud-best">--:--</strong></div>
          <div class="hud-data-row"><span>DELTA</span><strong id="hud-delta" class="delta-neg">-0.0</strong></div>
        </div>
        <div class="hud-data-col">
          <div class="hud-data-row"><span>G-LAT</span><strong id="hud-glat">0.0G</strong></div>
          <div class="hud-data-row"><span>G-LON</span><strong id="hud-glon">0.0G</strong></div>
          <div class="hud-data-row"><span>RPM</span><strong id="hud-rpm">8200</strong></div>
        </div>
      </div>
    </div>`;
    container.appendChild(hud);

    // HUD styles
    const hudStyle = document.createElement('style');
    hudStyle.textContent = `
    #race-hud{position:absolute;top:0;left:0;right:0;bottom:0;pointer-events:none;z-index:10;font-family:'JetBrains Mono','Orbitron',monospace}
    .hud-top-bar{display:flex;justify-content:space-between;align-items:center;padding:12px 20px;background:linear-gradient(180deg,rgba(0,0,0,.7),transparent)}
    .hud-live{display:flex;align-items:center;gap:6px;font-size:.7rem;letter-spacing:2px;color:#ff2d2d;font-weight:700}
    .hud-live-dot{width:8px;height:8px;background:#e60012;border-radius:50%;animation:hp 1.5s ease infinite}
    @keyframes hp{0%,100%{opacity:1;box-shadow:0 0 0 0 rgba(230,0,18,.7)}50%{opacity:.6;box-shadow:0 0 0 6px rgba(230,0,18,0)}}
    .hud-race-info{font-size:.65rem;color:#999;letter-spacing:2px}.hud-race-info span{color:#fff;font-weight:700}
    .hud-cam-name{font-size:.65rem;color:#e60012;letter-spacing:3px;background:rgba(230,0,18,.1);padding:4px 12px;border:1px solid rgba(230,0,18,.3);border-radius:4px}
    .hud-bottom{position:absolute;bottom:0;left:0;right:0;display:flex;justify-content:space-between;align-items:flex-end;padding:16px 20px;background:linear-gradient(0deg,rgba(0,0,0,.75),transparent)}
    .hud-driver-name{font-family:'Orbitron',sans-serif;font-size:.95rem;font-weight:800;color:#fff}
    .hud-driver-kart{font-size:.6rem;color:#e60012;letter-spacing:2px;margin-top:2px}
    .hud-telemetry{display:flex;align-items:flex-end;gap:20px}
    .hud-speed{text-align:center}
    .hud-speed-value{font-family:'Orbitron',sans-serif;font-size:2.5rem;font-weight:900;color:#fff;line-height:1;text-shadow:0 0 20px rgba(230,0,18,.4)}
    .hud-speed-unit{font-size:.55rem;color:#666;letter-spacing:3px;margin-top:2px}
    .hud-data-col{display:flex;flex-direction:column;gap:4px}
    .hud-data-row{display:flex;gap:8px;align-items:baseline;font-size:.6rem}
    .hud-data-row span{color:#555;letter-spacing:1px;min-width:40px}
    .hud-data-row strong{color:#ccc;font-weight:600}
    .delta-neg{color:#00e676!important}.delta-pos{color:#ff1744!important}`;
    document.head.appendChild(hudStyle);

    // Camera buttons
    const camButtons = {
        'btn-cam-chase': CAMERAS.CHASE,
        'btn-cam-onboard': CAMERAS.ONBOARD,
        'btn-cam-aerial': CAMERAS.AERIAL,
        'btn-cam-mirante': CAMERAS.MIRANTE,
        'btn-cam-cinematic': CAMERAS.CINEMATIC,
        'btn-cam-trackside': CAMERAS.TRACKSIDE,
    };
    const camLabels = {
        [CAMERAS.CHASE]: 'CHASE CAM', [CAMERAS.ONBOARD]: 'ONBOARD — KART #07',
        [CAMERAS.AERIAL]: 'VISTA AÉREA', [CAMERAS.MIRANTE]: 'MIRANTE 360°',
        [CAMERAS.CINEMATIC]: 'CINEMATIC', [CAMERAS.TRACKSIDE]: 'TRACKSIDE',
    };

    Object.entries(camButtons).forEach(([id, cam]) => {
        const btn = document.getElementById(id);
        if (btn) btn.addEventListener('click', () => {
            currentCamera = cam;
            document.getElementById('hud-cam-label').textContent = camLabels[cam];
            document.querySelectorAll('.cam-btn').forEach(b => b.classList.remove('active'));
            btn.classList.add('active');
        });
    });

    let autoCycle = false, cycleTimer = 0;
    const btnAuto = document.getElementById('btn-auto-cycle');
    if (btnAuto) btnAuto.addEventListener('click', () => {
        autoCycle = !autoCycle;
        btnAuto.textContent = autoCycle ? '⏹ STOP' : '▶ AUTO';
        btnAuto.classList.toggle('active', autoCycle);
    });

    // HUD refs
    const hudSpeed = document.getElementById('hud-speed');
    const hudLap = document.getElementById('hud-lap');
    const hudPos = document.getElementById('hud-pos');
    const hudBest = document.getElementById('hud-best');
    const hudDelta = document.getElementById('hud-delta');
    const hudGlat = document.getElementById('hud-glat');
    const hudGlon = document.getElementById('hud-glon');
    const hudRpm = document.getElementById('hud-rpm');
    const hudCamLabel = document.getElementById('hud-cam-label');

    // Orbit controls (aerial)
    let mouseDown = false, lastMX = 0, lastMY = 0;
    let orbAngle = 0, orbHeight = 55, orbDist = 65, tOrbAngle = 0, tOrbHeight = 55;

    canvas.addEventListener('mousedown', e => { if (currentCamera === CAMERAS.AERIAL) { mouseDown = true; lastMX = e.clientX; lastMY = e.clientY; } });
    canvas.addEventListener('mousemove', e => { if (!mouseDown) return; tOrbAngle += (e.clientX - lastMX) * 0.005; tOrbHeight = Math.max(15, Math.min(90, tOrbHeight - (e.clientY - lastMY) * 0.2)); lastMX = e.clientX; lastMY = e.clientY; });
    canvas.addEventListener('mouseup', () => mouseDown = false);
    canvas.addEventListener('mouseleave', () => mouseDown = false);
    canvas.addEventListener('wheel', e => { if (currentCamera === CAMERAS.AERIAL) { e.preventDefault(); orbDist = Math.max(25, Math.min(120, orbDist + e.deltaY * 0.05)); } }, { passive: false });

    // ══════════════════════════════════════════════════════════
    // ANIMATION
    // ══════════════════════════════════════════════════════════
    let prevTime = performance.now();
    let displaySpeed = 0;

    function animate() {
        requestAnimationFrame(animate);
        const now = performance.now();
        const dt = (now - prevTime) / 1000;
        prevTime = now;

        const player = karts[0];

        // Update karts
        karts.forEach((k, idx) => {
            k.prevT = k.t;
            const tan = trackCurve.getTangent(k.t).normalize();
            const curv = Math.abs(tan.x * tan.z);
            const sf = 1 - curv * 0.35;
            k.t = (k.t + k.speed * sf) % 1;

            if (k.prevT > 0.97 && k.t < 0.03) {
                k.lapCount++;
                const lt = now - k.currentLapStart;
                if (lt < k.bestLap) k.bestLap = lt;
                k.currentLapStart = now;
            }

            const pos = trackCurve.getPoint(k.t);
            const fwd = trackCurve.getTangent(k.t).normalize();
            k.mesh.position.set(pos.x, pos.y + 0.02, pos.z);
            k.mesh.lookAt(pos.x + fwd.x, pos.y + fwd.y + 0.02, pos.z + fwd.z);
            k.speedKmh = 55 + sf * 42 + Math.sin(now * 0.001 + idx) * 4;
        });

        // Positions
        const sorted = [...karts].sort((a, b) => b.lapCount !== a.lapCount ? b.lapCount - a.lapCount : b.t - a.t);
        const pPos = sorted.indexOf(player) + 1;

        // HUD
        displaySpeed += (player.speedKmh - displaySpeed) * 0.15;
        if (hudSpeed) hudSpeed.textContent = Math.round(displaySpeed);
        if (hudLap) hudLap.textContent = Math.min(player.lapCount + 1, 15);
        if (hudPos) hudPos.textContent = `P${pPos}`;
        if (hudBest && player.bestLap < Infinity) {
            const s = player.bestLap / 1000;
            hudBest.textContent = `${Math.floor(s / 60)}:${(s % 60).toFixed(1).padStart(4, '0')}`;
        }
        if (hudDelta) {
            const d = (Math.sin(now * 0.0005) * 1.5).toFixed(1);
            hudDelta.textContent = `${parseFloat(d) <= 0 ? '' : '+'}${d}`;
            hudDelta.className = parseFloat(d) <= 0 ? 'delta-neg' : 'delta-pos';
        }
        if (hudGlat) hudGlat.textContent = `${(Math.abs(Math.sin(now * 0.002)) * 1.5).toFixed(1)}G`;
        if (hudGlon) hudGlon.textContent = `${(Math.abs(Math.cos(now * 0.0015)) * 0.8).toFixed(1)}G`;
        if (hudRpm) hudRpm.textContent = Math.round(6000 + displaySpeed * 35);

        // Camera
        const pp = trackCurve.getPoint(player.t);
        const pt = trackCurve.getTangent(player.t).normalize();
        const pn = new THREE.Vector3(-pt.z, 0, pt.x).normalize();

        switch (currentCamera) {
            case CAMERAS.CHASE: {
                const ideal = new THREE.Vector3(pp.x - pt.x * 4.5, pp.y + 2.0, pp.z - pt.z * 4.5);
                camera.position.lerp(ideal, 0.08);
                camera.lookAt(pp.x + pt.x * 3, pp.y + 0.4, pp.z + pt.z * 3);
                camera.fov = 65 + displaySpeed * 0.04;
                camera.updateProjectionMatrix();
                break;
            }
            case CAMERAS.ONBOARD: {
                const driverPos = new THREE.Vector3(pp.x, pp.y + 0.8, pp.z);
                camera.position.lerp(driverPos, 0.15);
                camera.lookAt(pp.x + pt.x * 12, pp.y + 0.3, pp.z + pt.z * 12);
                camera.fov = 82 + displaySpeed * 0.06;
                camera.updateProjectionMatrix();
                break;
            }
            case CAMERAS.AERIAL: {
                if (!mouseDown) tOrbAngle += 0.002;
                orbAngle += (tOrbAngle - orbAngle) * 0.04;
                orbHeight += (tOrbHeight - orbHeight) * 0.04;
                camera.position.set(Math.sin(orbAngle) * orbDist, orbHeight, Math.cos(orbAngle) * orbDist);
                camera.lookAt(0, 2, 5);
                camera.fov = 60;
                camera.updateProjectionMatrix();
                break;
            }
            case CAMERAS.MIRANTE: {
                camera.position.lerp(new THREE.Vector3(0, 11, 5), 0.05);
                camera.lookAt(pp.x, pp.y, pp.z);
                camera.fov = 55;
                camera.updateProjectionMatrix();
                break;
            }
            case CAMERAS.CINEMATIC: {
                cinematicAngle += 0.004;
                const cr = 16 + Math.sin(cinematicAngle * 0.5) * 8;
                const ch = 3 + Math.sin(cinematicAngle * 0.3) * 2;
                const cp = new THREE.Vector3(pp.x + Math.sin(cinematicAngle) * cr, pp.y + ch, pp.z + Math.cos(cinematicAngle) * cr);
                camera.position.lerp(cp, 0.03);
                camera.lookAt(pp.x, pp.y + 0.4, pp.z);
                camera.fov = 40 + Math.sin(cinematicAngle * 0.7) * 10;
                camera.updateProjectionMatrix();
                break;
            }
            case CAMERAS.TRACKSIDE: {
                const tsP = trackCurve.getPoint(tracksideT);
                const tsT = trackCurve.getTangent(tracksideT).normalize();
                const tsN = new THREE.Vector3(-tsT.z, 0, tsT.x).normalize();
                const tsPos = new THREE.Vector3(tsP.x + tsN.x * 8, tsP.y + 1.8, tsP.z + tsN.z * 8);
                camera.position.lerp(tsPos, 0.05);
                camera.lookAt(pp.x, pp.y + 0.3, pp.z);
                camera.fov = 50;
                camera.updateProjectionMatrix();
                if (pp.distanceTo(tsP) < 7) tracksideT = (tracksideT + 0.12) % 1;
                break;
            }
        }

        // Auto-cycle
        if (autoCycle) {
            cycleTimer += dt;
            if (cycleTimer > 6) {
                cycleTimer = 0;
                const cl = Object.values(CAMERAS);
                currentCamera = cl[(cl.indexOf(currentCamera) + 1) % cl.length];
                if (hudCamLabel) hudCamLabel.textContent = camLabels[currentCamera];
                document.querySelectorAll('.cam-btn').forEach(b => b.classList.remove('active'));
                const aid = Object.entries(camButtons).find(([, v]) => v === currentCamera)?.[0];
                if (aid) document.getElementById(aid)?.classList.add('active');
            }
        }

        // Pulses
        domeLight.intensity = 3 + Math.sin(now * 0.003) * 1.5;
        domeRingMat.opacity = 0.5 + Math.sin(now * 0.002) * 0.3;
        redLights.forEach((rl, i) => { rl.intensity = 1 + Math.sin(now * 0.002 + i * 0.7) * 0.4; });

        renderer.render(scene, camera);
    }

    animate();

    // Resize
    const ro = new ResizeObserver(() => {
        width = container.clientWidth;
        height = container.clientHeight;
        camera.aspect = width / height;
        camera.updateProjectionMatrix();
        renderer.setSize(width, height);
    });
    ro.observe(container);
}
