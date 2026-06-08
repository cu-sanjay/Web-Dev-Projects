// ============================================================
//  QUANTUM CHESS — 4×4 Tactical Micro-State Board (#838)
//  Pure vanilla JS. No external libraries.
// ============================================================

const BOARD_SIZE = 4;
const FILES = ['a', 'b', 'c', 'd'];

const PIECE_UNICODE = {
  white: { king: '\u2654', rook: '\u2656', knight: '\u2658', pawn: '\u2659' },
  black: { king: '\u265A', rook: '\u265C', knight: '\u265E', pawn: '\u265F' },
};

let nextPieceId = 1;

class Piece {
  constructor(type, color, x, y) {
    this.id = nextPieceId++;
    this.type = type;
    this.color = color;
    this.x = x;
    this.y = y;
  }

  get char() {
    return PIECE_UNICODE[this.color][this.type] || '?';
  }

  get name() {
    return `${this.color} ${this.type}`;
  }

  get shortLabel() {
    return `${FILES[this.x]}${BOARD_SIZE - this.y}`;
  }
}

// ────────────────────────────────────────────────────────────
//  GAME ENGINE
// ────────────────────────────────────────────────────────────

class QuantumChess {
  constructor() {
    this.board = [];
    this.quantumRegistry = new Map();
    this.turn = 'white';
    this.selectedPiece = null;
    this.validMoves = [];
    this.quantumMode = false;
    this.quantumTargets = [];
    this.appState = 'idle';
    this.gameOver = false;
    this.winner = null;
    this.log = [];

    this.boardEl = document.getElementById('chess-board');
    this.turnEl = document.getElementById('turn-indicator');
    this.statusEl = document.getElementById('game-status');
    this.logEl = document.getElementById('quantum-log');
    this.quantumBtn = document.getElementById('quantum-toggle');
    this.resetBtn = document.getElementById('reset-btn');
    this.promoOverlay = document.getElementById('promotion-overlay');
    this.pendingPromotion = null;

    this.init();
    this.bindEvents();
    this.render();
  }

  // ── Initialisation ──

  init() {
    this.board = Array.from({ length: BOARD_SIZE }, () => Array(BOARD_SIZE).fill(null));
    this.quantumRegistry.clear();
    this.selectedPiece = null;
    this.validMoves = [];
    this.quantumMode = false;
    this.quantumTargets = [];
    this.appState = 'idle';
    this.gameOver = false;
    this.winner = null;
    this.turn = 'white';
    this.log = ['Game started — White to move.'];
    this.pendingPromotion = null;

    this.placePiece(new Piece('rook', 'white', 0, 3));
    this.placePiece(new Piece('knight', 'white', 1, 3));
    this.placePiece(new Piece('king', 'white', 2, 3));
    this.placePiece(new Piece('pawn', 'white', 3, 3));

    this.placePiece(new Piece('rook', 'black', 0, 0));
    this.placePiece(new Piece('knight', 'black', 1, 0));
    this.placePiece(new Piece('king', 'black', 2, 0));
    this.placePiece(new Piece('pawn', 'black', 3, 0));

    this.updateUI();
  }

  reset() {
    nextPieceId = 1;
    this.init();
    this.render();
    if (this.quantumBtn) this.quantumBtn.classList.remove('active');
  }

  placePiece(piece) {
    this.board[piece.y][piece.x] = piece;
  }

  getPiece(x, y) {
    if (x < 0 || x >= BOARD_SIZE || y < 0 || y >= BOARD_SIZE) return null;
    return this.board[y][x];
  }

  removePiece(x, y) {
    this.board[y][x] = null;
  }

  movePiece(piece, toX, toY) {
    this.board[piece.y][piece.x] = null;
    piece.x = toX;
    piece.y = toY;
    this.board[toY][toX] = piece;
  }

  // ── Quantum mechanics ──

  isQuantum(pieceId) {
    return this.quantumRegistry.has(pieceId);
  }

  getQuantumState(pieceId) {
    return this.quantumRegistry.get(pieceId);
  }

  getOtherQuantumPos(pieceId, x, y) {
    const qs = this.quantumRegistry.get(pieceId);
    if (!qs) return null;
    if (qs.posA.x === x && qs.posA.y === y) return qs.posB;
    if (qs.posB.x === x && qs.posB.y === y) return qs.posA;
    return null;
  }

  createQuantumSplit(piece, pos1, pos2) {
    const id = piece.id;
    this.quantumRegistry.set(id, { posA: { x: pos1.x, y: pos1.y }, posB: { x: pos2.x, y: pos2.y } });
    this.board[piece.y][piece.x] = null;
    piece.x = pos1.x;
    piece.y = pos1.y;
    this.board[pos1.y][pos1.x] = piece;
    this.board[pos2.y][pos2.x] = piece;

    this.addLog(
      `${piece.name} enters superposition at ${FILES[pos1.x]}${BOARD_SIZE - pos1.y} \u2295 ${FILES[pos2.x]}${BOARD_SIZE - pos2.y}`,
      'quantum'
    );
  }

  collapsePiece(pieceId, targetPos) {
    const qs = this.quantumRegistry.get(pieceId);
    if (!qs) return null;

    const otherPos = (qs.posA.x === targetPos.x && qs.posA.y === targetPos.y) ? qs.posB : qs.posA;
    const piece = this.board[otherPos.y][otherPos.x];
    if (!piece) return null;

    this.quantumRegistry.delete(pieceId);

    this.board[otherPos.y][otherPos.x] = null;
    piece.x = targetPos.x;
    piece.y = targetPos.y;
    this.board[targetPos.y][targetPos.x] = piece;

    this.addLog(
      `${piece.name} wavefunction collapses to ${FILES[targetPos.x]}${BOARD_SIZE - targetPos.y}`,
      'quantum'
    );
    return piece;
  }

  collapseOnAttack(pieceId, attackedPos) {
    const collapseHere = Math.random() < 0.5;
    const qs = this.getQuantumState(pieceId);
    if (!qs) return { piece: this.getPiece(attackedPos.x, attackedPos.y), captured: true };

    const targetPos = collapseHere ? attackedPos : (
      (qs.posA.x === attackedPos.x && qs.posA.y === attackedPos.y) ? qs.posB : qs.posA
    );
    this.collapsePiece(pieceId, targetPos);
    const captured = collapseHere;
    this.addLog(
      `Collapse ${captured ? 'confirms' : 'avoids'} capture at ${FILES[attackedPos.x]}${BOARD_SIZE - attackedPos.y}!`,
      'quantum'
    );
    return { piece: this.getPiece(targetPos.x, targetPos.y), captured };
  }

  // ── Move generation — per piece type ──

  getRawMoves(piece) {
    switch (piece.type) {
      case 'king': return this._kingMoves(piece);
      case 'rook': return this._rookMoves(piece);
      case 'knight': return this._knightMoves(piece);
      case 'pawn': return this._pawnMoves(piece);
      default: return [];
    }
  }

  _kingMoves(piece) {
    const moves = [];
    for (const [dx, dy] of [[-1,-1],[0,-1],[1,-1],[-1,0],[1,0],[-1,1],[0,1],[1,1]]) {
      const x = piece.x + dx, y = piece.y + dy;
      if (x < 0 || x >= BOARD_SIZE || y < 0 || y >= BOARD_SIZE) continue;
      const t = this.getPiece(x, y);
      if (t && t.color === piece.color) continue;
      moves.push({ x, y, capture: t || null, promotion: false });
    }
    return moves;
  }

  _rookMoves(piece) {
    const moves = [];
    for (const [dx, dy] of [[0,-1],[0,1],[-1,0],[1,0]]) {
      let x = piece.x + dx, y = piece.y + dy;
      while (x >= 0 && x < BOARD_SIZE && y >= 0 && y < BOARD_SIZE) {
        const t = this.getPiece(x, y);
        if (t) {
          if (t.color !== piece.color) moves.push({ x, y, capture: t, promotion: false });
          break;
        }
        moves.push({ x, y, capture: null, promotion: false });
        x += dx; y += dy;
      }
    }
    return moves;
  }

  _knightMoves(piece) {
    const moves = [];
    for (const [dx, dy] of [[-2,-1],[-2,1],[-1,-2],[-1,2],[1,-2],[1,2],[2,-1],[2,1]]) {
      const x = piece.x + dx, y = piece.y + dy;
      if (x < 0 || x >= BOARD_SIZE || y < 0 || y >= BOARD_SIZE) continue;
      const t = this.getPiece(x, y);
      if (t && t.color === piece.color) continue;
      moves.push({ x, y, capture: t || null, promotion: false });
    }
    return moves;
  }

  _pawnMoves(piece) {
    const moves = [];
    const dir = piece.color === 'white' ? -1 : 1;
    const fy = piece.y + dir;
    if (fy < 0 || fy >= BOARD_SIZE) return moves;

    if (!this.getPiece(piece.x, fy)) {
      const promo = fy === 0 || fy === BOARD_SIZE - 1;
      moves.push({ x: piece.x, y: fy, capture: null, promotion: promo });
    }
    for (const dx of [-1, 1]) {
      const cx = piece.x + dx;
      if (cx < 0 || cx >= BOARD_SIZE) continue;
      const t = this.getPiece(cx, fy);
      if (t && t.color !== piece.color) {
        const promo = fy === 0 || fy === BOARD_SIZE - 1;
        moves.push({ x: cx, y: fy, capture: t, promotion: promo });
      }
    }
    return moves;
  }

  // ── Attack / check detection ──

  canPieceAttackSquare(piece, fromX, fromY, targetX, targetY) {
    const dx = targetX - fromX, dy = targetY - fromY;
    const adx = Math.abs(dx), ady = Math.abs(dy);
    switch (piece.type) {
      case 'king': return adx <= 1 && ady <= 1;
      case 'rook':
        if (dx !== 0 && dy !== 0) return false;
        return this._pathClear(fromX, fromY, targetX, targetY);
      case 'knight': return (adx === 2 && ady === 1) || (adx === 1 && ady === 2);
      case 'pawn': {
        const dir = piece.color === 'white' ? -1 : 1;
        return dy === dir && adx === 1;
      }
      default: return false;
    }
  }

  _pathClear(x1, y1, x2, y2) {
    if (x1 === x2) {
      const lo = Math.min(y1, y2), hi = Math.max(y1, y2);
      for (let y = lo + 1; y < hi; y++) if (this.board[y][x1]) return false;
      return true;
    }
    if (y1 === y2) {
      const lo = Math.min(x1, x2), hi = Math.max(x1, x2);
      for (let x = lo + 1; x < hi; x++) if (this.board[y1][x]) return false;
      return true;
    }
    return false;
  }

  isSquareAttacked(x, y, byColor) {
    for (let r = 0; r < BOARD_SIZE; r++) {
      for (let c = 0; c < BOARD_SIZE; c++) {
        const p = this.board[r][c];
        if (!p || p.color !== byColor) continue;
        if (this.isQuantum(p.id)) {
          const qs = this.getQuantumState(p.id);
          if (this.canPieceAttackSquare(p, qs.posA.x, qs.posA.y, x, y)) return true;
          if (this.canPieceAttackSquare(p, qs.posB.x, qs.posB.y, x, y)) return true;
        } else {
          if (this.canPieceAttackSquare(p, p.x, p.y, x, y)) return true;
        }
      }
    }
    return false;
  }

  findKing(color) {
    for (let r = 0; r < BOARD_SIZE; r++)
      for (let c = 0; c < BOARD_SIZE; c++) {
        const p = this.board[r][c];
        if (p && p.type === 'king' && p.color === color) return p;
      }
    return null;
  }

  isInCheck(color) {
    const king = this.findKing(color);
    if (!king) return false;
    const opp = color === 'white' ? 'black' : 'white';
    return this.isSquareAttacked(king.x, king.y, opp);
  }

  // ── Valid move filtering ──

  getValidMoves(piece) {
    const raw = this.getRawMoves(piece);
    const valid = [];
    for (const move of raw) {
      const toPiece = this.board[move.y][move.x];
      const ox = piece.x, oy = piece.y;

      this.board[oy][ox] = null;
      piece.x = move.x; piece.y = move.y;
      this.board[move.y][move.x] = piece;

      const inCheck = this.isInCheck(piece.color);

      this.board[move.y][move.x] = toPiece;
      piece.x = ox; piece.y = oy;
      this.board[oy][ox] = piece;

      if (!inCheck) valid.push(move);
    }
    return valid;
  }

  // ── Move execution ──

  executeMove(piece, toX, toY, moveInfo) {
    const target = this.getPiece(toX, toY);

    if (target && this.isQuantum(target.id) && target.color !== piece.color) {
      const result = this.collapseOnAttack(target.id, { x: toX, y: toY });
      if (!result.captured) {
        this.movePiece(piece, toX, toY);
        this.addLog(`${piece.name} advances to ${FILES[toX]}${BOARD_SIZE - toY} — quantum target evaded.`);
        this._afterMove(piece, null);
        this.render();
        return;
      }
    }

    if (target) {
      if (target.type === 'king') {
        this.board[toY][toX] = null;
        this.movePiece(piece, toX, toY);
        this.winner = piece.color;
        this.gameOver = true;
        this.addLog(`${piece.name} captures the ${target.color} king! ${piece.color} wins!`, 'win');
        this.updateUI();
        this.render();
        return;
      }
      this.board[target.y][target.x] = null;
      this.addLog(`${piece.name} captures ${target.name} at ${FILES[toX]}${BOARD_SIZE - toY}`);
    } else {
      this.addLog(`${piece.name} → ${FILES[toX]}${BOARD_SIZE - toY}`);
    }

    this.movePiece(piece, toX, toY);

    if (moveInfo && moveInfo.promotion) {
      this.pendingPromotion = { piece, x: toX, y: toY };
      this.promoOverlay.classList.remove('hidden');
      this.render();
      return;
    }

    this._afterMove(piece, target);
    this.render();
  }

  _afterMove(piece, captured) {
    const nextColor = this.turn === 'white' ? 'black' : 'white';

    if (this.isInCheck(nextColor)) {
      const k = this.findKing(nextColor);
      if (k) {
        this.addLog(`${nextColor} king is in check!`, 'check');
      }
    }

    this.turn = nextColor;
    this.selectedPiece = null;
    this.validMoves = [];
    this.quantumTargets = [];
    this.appState = 'idle';
    this.quantumMode = false;
    if (this.quantumBtn) this.quantumBtn.classList.remove('active');
    this.updateUI();
  }

  promotePawn(pieceType) {
    if (!this.pendingPromotion) return;
    const { piece, x, y } = this.pendingPromotion;
    this.pendingPromotion = null;
    this.promoOverlay.classList.add('hidden');

    this.board[y][x] = null;
    const newPiece = new Piece(pieceType, piece.color, x, y);
    this.board[y][x] = newPiece;
    this.addLog(`${piece.color} pawn promotes to ${pieceType} at ${FILES[x]}${BOARD_SIZE - y}`);

    this._afterMove(newPiece, null);
    this.render();
  }

  // ── Quantum split execution ──

  executeQuantumSplit(piece, pos1, pos2) {
    this.createQuantumSplit(piece, pos1, pos2);
    this.selectedPiece = null;
    this.validMoves = [];
    this.quantumTargets = [];
    this.appState = 'idle';
    this.quantumMode = false;
    if (this.quantumBtn) this.quantumBtn.classList.remove('active');

    const nextColor = this.turn === 'white' ? 'black' : 'white';
    if (this.isInCheck(nextColor)) {
      this.addLog(`${nextColor} king is in check!`, 'check');
    }

    this.turn = nextColor;
    this.updateUI();
    this.render();
  }

  // ── Cell click handler ──

  handleCellClick(x, y, shiftKey) {
    if (this.gameOver || this.pendingPromotion) return;

    const clickedPiece = this.getPiece(x, y);

    if (this.quantumMode && this.selectedPiece && this.appState === 'pieceSelected') {
      if (clickedPiece && clickedPiece !== this.selectedPiece && clickedPiece.color !== this.selectedPiece.color) {
        this.quantumMode = false;
        if (this.quantumBtn) this.quantumBtn.classList.remove('active');
        this.executeMove(this.selectedPiece, x, y, null);
        return;
      }
      const isTarget = this.validMoves.some(m => m.x === x && m.y === y && !m.capture);
      if (isTarget) {
        if (this.quantumTargets.length === 0) {
          this.quantumTargets.push({ x, y });
          this.appState = 'quantumSelecting';
          this.render();
          return;
        } else if (this.quantumTargets.length === 1) {
          const first = this.quantumTargets[0];
          if (x === first.x && y === first.y) return;
          if (this.validMoves.some(m => m.x === x && m.y === y && !m.capture)) {
            this.quantumTargets.push({ x, y });
            this.executeQuantumSplit(this.selectedPiece, first, { x, y });
            return;
          }
        }
      }
      this.quantumTargets = [];
      this.appState = 'pieceSelected';
      this.render();
      return;
    }

    if (clickedPiece && clickedPiece.color === this.turn) {
      if (this.isQuantum(clickedPiece.id)) {
        this.collapsePiece(clickedPiece.id, { x, y });
        this.selectedPiece = this.getPiece(x, y);
      } else {
        this.selectedPiece = clickedPiece;
      }
      this.validMoves = this.getValidMoves(this.selectedPiece);
      this.quantumTargets = [];
      this.appState = 'pieceSelected';
      this.render();
      this.updateUI();
      return;
    }

    if (this.selectedPiece && this.validMoves.some(m => m.x === x && m.y === y)) {
      const moveInfo = this.validMoves.find(m => m.x === x && m.y === y);
      this.executeMove(this.selectedPiece, x, y, moveInfo);
      return;
    }

    this.selectedPiece = null;
    this.validMoves = [];
    this.quantumTargets = [];
    this.appState = 'idle';
    this.render();
    this.updateUI();
  }

  // ── Logging ──

  addLog(msg, cls) {
    this.log.push(msg);
    if (this.logEl) {
      const entry = document.createElement('div');
      entry.textContent = '\u203A ' + msg;
      if (cls) entry.classList.add('log-entry', cls + '-event');
      else entry.classList.add('log-entry');
      this.logEl.appendChild(entry);
      this.logEl.scrollTop = this.logEl.scrollHeight;
    }
  }

  // ── UI updates ──

  updateUI() {
    if (this.turnEl) {
      const label = this.turn === 'white' ? 'White' : 'Black';
      this.turnEl.textContent = `${label} to move`;
      this.turnEl.style.color = this.turn === 'white' ? 'var(--neon-cyan)' : 'var(--neon-magenta)';
    }
    if (this.statusEl) {
      if (this.gameOver) {
        this.statusEl.textContent = this.winner ? `${this.winner} wins!` : 'Draw';
        this.statusEl.style.color = 'var(--neon-green)';
      } else if (this.isInCheck(this.turn)) {
        this.statusEl.textContent = 'Check!';
        this.statusEl.style.color = 'var(--neon-orange)';
      } else {
        this.statusEl.textContent = this.selectedPiece ? 'Select target' : 'Select a piece';
        this.statusEl.style.color = 'var(--text-dim)';
      }
    }
    if (this.logEl && this.log.length === 1) {
      this.logEl.innerHTML = '<div class="log-header">QUANTUM LOG</div>';
      this.addLog(this.log[0]);
    }
  }

  // ── Rendering ──

  render() {
    if (!this.boardEl) return;
    this.boardEl.innerHTML = '';

    const allQuantumSquares = new Set();
    for (const [id, qs] of this.quantumRegistry) {
      allQuantumSquares.add(`${qs.posA.x},${qs.posA.y}`);
      allQuantumSquares.add(`${qs.posB.x},${qs.posB.y}`);
    }

    let inCheckPos = null;
    if (!this.gameOver) {
      const k = this.findKing(this.turn === 'white' ? 'black' : 'white');
      if (k && this.isInCheck(k.color)) inCheckPos = { x: k.x, y: k.y };
    }

    for (let y = 0; y < BOARD_SIZE; y++) {
      for (let x = 0; x < BOARD_SIZE; x++) {
        const cell = document.createElement('div');
        const shade = (x + y) % 2 === 0 ? 'dark' : 'light';
        cell.className = `cell ${shade}`;

        const file = FILES[x];
        const rank = BOARD_SIZE - y;
        cell.dataset.x = x;
        cell.dataset.y = y;
        cell.dataset.coord = `${file}${rank}`;

        const fileLabel = document.createElement('span');
        fileLabel.className = 'coord file';
        fileLabel.textContent = file;
        cell.appendChild(fileLabel);

        const rankLabel = document.createElement('span');
        rankLabel.className = 'coord rank';
        rankLabel.textContent = rank;
        cell.appendChild(rankLabel);

        const key = `${x},${y}`;
        if (allQuantumSquares.has(key)) cell.classList.add('quantum-super');

        if (inCheckPos && inCheckPos.x === x && inCheckPos.y === y) cell.classList.add('in-check');

        const piece = this.getPiece(x, y);
        if (piece) {
          const span = document.createElement('span');
          span.className = `piece-char ${piece.color}-piece`;
          span.textContent = piece.char;
          if (this.isQuantum(piece.id)) {
            const qs = this.getQuantumState(piece.id);
            const isA = qs.posA.x === x && qs.posA.y === y;
            const label = isA ? '\u03b1' : '\u03b2';
            const sub = document.createElement('sup');
            sub.textContent = label;
            sub.style.cssText = 'font-size:14px;position:absolute;top:2px;right:4px;opacity:0.6;';
            cell.appendChild(sub);
          }
          cell.appendChild(span);
        }

        if (this.selectedPiece) {
          const sx = this.selectedPiece.x, sy = this.selectedPiece.y;
          if (this.isQuantum(this.selectedPiece.id)) {
            const qs = this.getQuantumState(this.selectedPiece.id);
            if ((qs.posA.x === sx && qs.posA.y === sy) ||
                (qs.posB.x === sx && qs.posB.y === sy)) {
              if (x === sx && y === sy) cell.classList.add('selected');
            }
          } else {
            if (x === sx && y === sy) cell.classList.add('selected');
          }
        }

        if (this.validMoves.some(m => m.x === x && m.y === y)) {
          if (this.quantumMode && this.appState === 'pieceSelected' && !this.getPiece(x, y)) {
            const qDot = document.createElement('div');
            qDot.className = 'quantum-target';
            cell.appendChild(qDot);
          } else if (this.quantumTargets.length > 0 && this.quantumTargets[0].x === x && this.quantumTargets[0].y === y) {
            const qDot = document.createElement('div');
            qDot.className = 'quantum-target first';
            cell.appendChild(qDot);
          } else if (!this.quantumMode || this.getPiece(x, y)) {
            const dot = document.createElement('div');
            const isCapture = this.getPiece(x, y) !== null;
            dot.className = `move-dot ${isCapture ? 'capture' : 'empty'}`;
            cell.appendChild(dot);
          }
        }

        cell.addEventListener('click', () => this.handleCellClick(x, y, false));
        this.boardEl.appendChild(cell);
      }
    }
  }

  // ── Event binding ──

  bindEvents() {
    if (this.quantumBtn) {
      this.quantumBtn.addEventListener('click', () => {
        if (this.gameOver) return;
        if (!this.selectedPiece || this.appState !== 'pieceSelected') {
          if (this.quantumTargets.length > 0) {
            this.quantumTargets = [];
            this.appState = 'idle';
            this.selectedPiece = null;
            this.validMoves = [];
          }
          this.quantumMode = false;
          this.quantumBtn.classList.remove('active');
          this.render();
          this.updateUI();
          return;
        }
        this.quantumMode = !this.quantumMode;
        if (this.quantumMode) {
          const targets = this.validMoves.filter(m => !m.capture);
          if (targets.length < 2) {
            this.quantumMode = false;
            this.quantumBtn.classList.remove('active');
            this.addLog('Need at least 2 empty target squares for a quantum split.');
            return;
          }
          this.quantumBtn.classList.add('active');
          this.quantumTargets = [];
          this.appState = 'pieceSelected';
        } else {
          this.quantumBtn.classList.remove('active');
          this.quantumTargets = [];
          this.appState = 'pieceSelected';
        }
        this.render();
      });
    }

    if (this.resetBtn) {
      this.resetBtn.addEventListener('click', () => {
        this.reset();
        if (this.logEl) {
          this.logEl.innerHTML = '<div class="log-header">QUANTUM LOG</div>';
        }
      });
    }

    document.querySelectorAll('.promo-btn').forEach(btn => {
      btn.addEventListener('click', () => {
        this.promotePawn(btn.dataset.piece);
      });
    });

    document.addEventListener('keydown', (e) => {
      if (e.key === 'Escape') {
        if (!this.promoOverlay.classList.contains('hidden')) {
          this.promoOverlay.classList.add('hidden');
          this.pendingPromotion = null;
          this.render();
          return;
        }
        this.selectedPiece = null;
        this.validMoves = [];
        this.quantumTargets = [];
        this.quantumMode = false;
        this.appState = 'idle';
        if (this.quantumBtn) this.quantumBtn.classList.remove('active');
        this.render();
        this.updateUI();
      }
      if (e.key === 'q' || e.key === 'Q') {
        if (this.quantumBtn) this.quantumBtn.click();
      }
    });
  }
}

// ────────────────────────────────────────────────────────────
//  BOOT
// ────────────────────────────────────────────────────────────

document.addEventListener('DOMContentLoaded', () => {
  window.game = new QuantumChess();
});
