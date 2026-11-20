# Prompts — Ilustrações anatômicas 3D dos exercícios (Vida Leve)

Use estes prompts em um gerador de imagens (por exemplo: ChatGPT/DALL·E, Midjourney, Leonardo, Ideogram, Firefly).
**Estas imagens ainda não foram geradas** — este arquivo contém apenas os prompts.

## Como usar

1. Gere **primeiro a imagem 12 (postura da criança)** ou a **2 (borboleta)** e escolha o resultado de que mais gostar. Ela será o “modelo-mestre”.
2. Para as outras 11, envie essa imagem escolhida como **referência de personagem/estilo** (no Midjourney: `--cref` / `--sref`; no ChatGPT: anexe a imagem e diga “mesmo modelo anatômico, mesma iluminação e estilo”). Assim todas ficam com o mesmo corpo.
3. Cole o **bloco de estilo (A)** + o **prompt do exercício** + o **negativo (B)**.
4. Peça **1080 × 1080**, formato quadrado. Se o gerador não fizer fundo transparente, peça fundo branco puro e remova o fundo depois (ex.: remove.bg, Canva, Photoshop).
5. Salve com o nome indicado e coloque na pasta `public/images/exercicios/` do projeto (ou me envie as imagens que eu coloco). As imagens aparecem sozinhas no site.

> Use apenas imagens geradas por você ou com licença de uso. Não use imagens de outros perfis.

---

## A) Bloco de estilo (colar em TODOS os prompts)

```
Professional 3D anatomical illustration for an exercise and physiotherapy guide. One single adult human anatomical model, gender-neutral and unisex: no breasts, no beard, no hair, no genitals, smooth neutral simplified face without gender features, natural balanced body proportions, moderate realistic muscle definition (not a bodybuilder). The whole body is rendered in smooth matte silver-gray, like a high-quality educational écorché model, with realistic anatomical muscle texture. Only the muscle groups worked in the exercise are highlighted in saturated red. Soft professional studio lighting, gentle shadows, high detail, hyper-realistic 3D render. Full body visible and centered with comfortable margins, nothing cropped (hands, feet and head fully visible). Plain pure white or transparent background, no floor objects, no props unless specified. Square 1:1, 1080x1080. Same model, same proportions, same lighting and same style in every image of the series.
```

## B) Negativo (colar em TODOS)

```
no text, no letters, no numbers, no arrows, no labels, no watermark, no logo, no border, no frame, no icons, no symbols, no extra people, no clothing, no hair, no beard, no breasts, no exaggerated bodybuilder muscles, no cartoon, no stick figure, no photo of a real person, no cropped limbs, no extra fingers or limbs, no distorted anatomy
```

---

## C) Prompts por exercício

### 01 — Rotação espinhal sentada → `exercicio-01-rotacao-espinhal.png`
```
Seated spinal twist on the floor, three-quarter back view. The model sits upright on the floor, left leg extended straight forward, right knee bent with the right foot flat on the floor crossing outside the left knee. Right hand on the floor behind the hips for support, left arm hugging the right knee, torso and head gently rotated to the right. Red highlight: erector spinae along the spine, obliques, and right gluteus.
```

### 02 — Borboleta sentada → `exercicio-02-borboleta-sentada.png`
```
Seated butterfly stretch, front view. The model sits upright on the floor, soles of the feet together close to the body, knees relaxed out to the sides, both hands holding the feet, spine tall, shoulders relaxed, looking forward. Red highlight: inner thigh muscles (adductors) on both legs.
```

### 03 — Alongamento da cobra → `exercicio-03-alongamento-cobra.png`
```
Low cobra pose, side view. The model lies face down, legs extended straight back with the tops of the feet on the floor, hips and thighs on the floor, palms under the shoulders, elbows bent close to the body, chest gently lifted, neck long, looking slightly forward. Red highlight: abdominal muscles (rectus abdominis) and hip flexors at the front of the hips.
```

### 04 — Cachorro olhando para baixo → `exercicio-04-cachorro-olhando-baixo.png`
```
Downward facing dog, side view. Inverted V shape: hands flat on the floor shoulder-width apart, arms straight, hips lifted high, legs long with knees slightly bent, heels reaching toward the floor, head relaxed between the arms. Red highlight: hamstrings and calves on the back of the legs, latissimus dorsi, and shoulders.
```

### 05 — Afundo profundo → `exercicio-05-afundo-profundo.png`
```
Low lunge with back knee down, side view. Right foot forward with the knee bent at about 90 degrees above the ankle, left knee resting on the floor behind with the top of the foot on the floor, torso upright, hands resting on the front knee, hips gently pressed forward. Red highlight: hip flexors (iliopsoas) and quadriceps of the back leg.
```

### 06 — Meia abertura → `exercicio-06-meia-abertura.png`
```
Half split, side view. Left knee on the floor directly under the hip, right leg extended straight forward with the heel on the floor and toes pointing up, torso hinged forward with a straight back, fingertips touching the floor on both sides of the front leg. Red highlight: hamstrings of the extended front leg.
```

### 07 — Afundo crescente → `exercicio-07-afundo-crescente.png`
```
High crescent lunge, side view. Right foot forward with the knee bent above the ankle, left leg extended back with the heel lifted and knee slightly bent off the floor, torso upright, both arms raised overhead, palms facing each other, shoulders relaxed. Red highlight: quadriceps and glutes of the front leg, hip flexors of the back leg, and core.
```

### 08 — Afundo do lagarto → `exercicio-08-afundo-lagarto.png`
```
Lizard lunge, three-quarter side view. Right foot forward placed outside the right hand, front knee bent, left knee resting on the floor behind, both hands flat on the floor inside the front foot, torso low and long, neck in line with the spine. Red highlight: hip flexors, groin (adductors), and glutes.
```

### 09 — Postura do camelo (adaptada) → `exercicio-09-postura-camelo.png`
> Na referência, a figura 9 foi chamada de “agachamento profundo”, mas a postura mostrada é a **postura do camelo** (ajoelhada, tronco inclinado para trás). Para o público iniciante, o prompt usa a **versão adaptada**, com as mãos apoiando a lombar.
```
Supported camel pose, side view. The model kneels with knees hip-width apart, thighs vertical, hips stacked over the knees, both hands supporting the lower back with fingers pointing down, chest lifted and gently opened, slight backward lean, neck neutral (head not dropped back). Red highlight: abdominals, chest, and hip flexors/quadriceps at the front of the thighs.
```

### 10 — Alongamento do psoas → `exercicio-10-alongamento-psoas.png`
```
Kneeling hip flexor (psoas) stretch, side view. Right foot forward with the knee bent at 90 degrees, left knee on the floor behind, torso fully upright, hands resting on the hips, pelvis slightly tucked, hips gently pushed forward. Red highlight: iliopsoas and front of the hip of the back leg.
```

### 11 — Alongamento em malasana → `exercicio-11-malasana.png`
```
Malasana yogic squat, front view. Feet slightly wider than the hips with toes turned out, heels on the floor, hips lowered into a deep squat, knees wide, torso upright, palms pressed together in front of the chest with the elbows inside the knees gently pressing them apart. Red highlight: inner thighs (adductors), glutes, and calves.
```

### 12 — Alongamento da criança → `exercicio-12-alongamento-crianca.png`
```
Child's pose, side view. The model kneels and sits back on the heels, torso folded forward resting on the thighs, forehead on the floor, arms extended forward on the floor with palms down, back gently rounded and relaxed. Red highlight: lower back muscles (erector spinae) and latissimus dorsi.
```

---

## D) Checklist antes de salvar

- [ ] Corpo inteiro visível, sem cortes.
- [ ] Mesmo modelo unissex em todas (sem cabelo, barba ou seios).
- [ ] Apenas os músculos indicados em vermelho.
- [ ] Nenhum texto, seta, número ou marca-d’água.
- [ ] 1080 × 1080, PNG, fundo transparente (ou branco puro).
- [ ] Postura confere com o passo a passo do exercício no site.
- [ ] Nome do arquivo exatamente como indicado.
