import React, { useEffect, useState, useCallback, useMemo } from 'react';
import { Modal, Button, Header, Menu, Message } from 'semantic-ui-react';
import { useAppDispatch, useAppSelector } from '../../app/hooks';
import { characters } from '../../utility/data';
import './AttackForm.css';

import { BoardAction } from '../../types/action';
import { addAction, removeAction } from '../../reducers/game/gameSlice';
import { AttackDetails } from './AttackDetails';
import { Ship } from '../../types/ship';
import { DirectionalBomb, WeaponType } from '../../types/items';
import { getInitialHits } from '../../utility/getInitialHits';

interface AttackFormProps {
  coords: string;
  open: boolean;
  setOpen: React.Dispatch<React.SetStateAction<boolean>>;
}

export const AttackForm = ({ coords, open, setOpen }: AttackFormProps) => {
  const [edit, setEdit] = useState(false);
  const users = useAppSelector((s) => s.game.users);
  const actions = useAppSelector((s) => s.game.actions);
  const ships = useAppSelector((s) => s.game.ships);
  const levels = useAppSelector((s) => s.game.levels);
  const items = useAppSelector((s) => s.game.store);
  const directionalBomb = useMemo(() => items.find((i) => i.type === 'directional') as DirectionalBomb, [items]);
  const settings = useAppSelector((s) => s.settings);
  const [override, setOverride] = useState(0);
  const dispatch = useAppDispatch();
  const segmentsMap = useMemo(() => {
    const map = new Map<string, Ship>();
    ships.forEach((ship) => {
      ship.segments.forEach((segment) => {
        map.set(`${segment.x}-${segment.y}`, ship);
      });
    });
    return map;
  }, [ships]);
  const attacksSet = useMemo(() => {
    const attacks = new Set<string>();
    actions
      .filter((a) => a.type === 'attack')
      .forEach(({ x, y, hits }) => {
        attacks.add(`${x}-${y}`);
        hits.forEach(({ oX, oY }) => {
          attacks.add(`${x + (oX ?? 0)}-${y + (oY ?? 0)}`);
        });
      });
    return attacks;
  }, [actions]);

  const [x, y] = useMemo(() => coords.split('-').map((n) => Number(n)), [coords]);

  const initialAction = useMemo(() => {
    const init = actions.find((a) => a.x === x && a.y === y && a.type === 'attack');
    if (init) setEdit(true);

    return init;
  }, [actions, x, y]);

  const weaponType: WeaponType = initialAction?.weapons[0] || 'missile';
  const [action, setAction] = useState<BoardAction>(
    initialAction || {
      id: Date.now(),
      type: 'attack',
      attacker: -1,
      x,
      y,
      direction: 'right',
      hits: getInitialHits(coords, 'right', directionalBomb, users, weaponType, segmentsMap, attacksSet),
      weapons: [weaponType],
    }
  );

  useEffect(() => {
    setOverride(0);
  }, [action]);

  const range = useMemo(() => {
    const rangedWeapon = items.find((i) => i.type === action.weapons[1]);
    let rangeModifier = settings.upgrades.range[levels.range].attackRange;

    if (!rangedWeapon) {
      return rangeModifier;
    }

    if (rangedWeapon.type === 'ranged') {
      rangeModifier += rangedWeapon.distance;
    }

    return rangeModifier;
  }, [levels, settings, action.weapons, items]);

  const validRangeSet = useMemo(() => {
    const validRange = new Set<string>();
    if (action.weapons[1] === 'longranged') {
      return validRange;
    }
    segmentsMap.forEach((_, coord) => {
      if (attacksSet.has(coord)) {
        return;
      }

      const [x, y] = coord.split('-').map((n) => Number(n));
      const startX = x - range;
      const endX = x + range;
      const startY = y - range;
      const endY = y + range;
      for (let iX = startX; iX <= endX; iX++) {
        if (iX < 1) continue;
        for (let iY = startY; iY <= endY; iY++) {
          if (iY < 1 || validRange.has(`${iX}-${iY}`)) continue;
          validRange.add(`${iX}-${iY}`);
        }
      }
    });

    return validRange;
  }, [segmentsMap, attacksSet, range, action.weapons]);

  const onSetAttacker = useCallback(
    (attacker: number) => {
      setAction((a) => ({
        ...a,
        attacker,
        direction: 'right',
        hits: getInitialHits(coords, 'right', directionalBomb, users, 'missile', segmentsMap, attacksSet),
        weapons: ['missile'],
      }));
    },
    [attacksSet, coords, directionalBomb, segmentsMap, users]
  );
  const onClearAttacker = useCallback(() => {
    setAction((a) => ({
      ...a,
      attacker: -1,
      hits: [],
      weapons: ['missile'],
    }));
  }, []);

  const onOverride = useCallback(() => {
    setOverride((o) => o + 1);
  }, []);

  const onSave = useCallback(() => {
    if (edit) {
      dispatch(removeAction([action.id, settings]));
    }
    dispatch(addAction([action as BoardAction, settings]));
    setOpen(false);
  }, [dispatch, action, settings, setOpen, edit]);

  const onRemove = useCallback(() => {
    dispatch(removeAction([action.id, settings]));
    setOpen(false);
  }, [dispatch, action.id, settings, setOpen]);

  const [valid, reason] = useMemo((): [boolean, string?] => {
    if (action.attacker < 0) {
      return [false, 'You must select an attacker'];
    }

    if (action.attacker !== users.self.id) {
      return [true];
    }

    if (override < 5 && !validRangeSet.has(coords) && action.weapons[1] !== 'longranged') {
      return [false, 'Your ships are out of range.'];
    }

    return [true];
  }, [action, validRangeSet, users, coords, override]);

  const HIT = action.weapons[0] === 'missile' && segmentsMap.has(coords);
  const SUNK = action.weapons[0] === 'missile' && !!action.hits.find(({ userId }) => userId === users.self.id)?.sunk;

  return (
    <Modal
      open={open}
      onClose={() => {
        setOpen(false);
      }}
      dimmer="blurring"
      className="cell-modal"
    >
      <Modal.Header style={{ color: HIT ? 'red' : 'black' }}>
        {`${characters[y]}${x}`}
        {HIT ? " - YOU'RE HIT" : ''}
        {SUNK ? ' AND SUNK' : ''}
      </Modal.Header>
      <Modal.Content>
        <div className="attack-form">
          {/* Attacker */}
          <Header onClick={onOverride} as="h3" style={{ margin: 0 }}>
            Attacker
          </Header>
          {action.attacker > -1 ? (
            (() => {
              const user = action.attacker === users.self.id ? users.self : users.opponents.find((u) => u.id === action.attacker);
              return (
                <Menu vertical size="tiny">
                  <Menu.Item onClick={onClearAttacker}>{user?.name}</Menu.Item>
                </Menu>
              );
            })()
          ) : (
            <Menu vertical size="tiny">
              <Menu.Item onClick={() => onSetAttacker(users.self.id)}>{users.self.name}</Menu.Item>
              {users.opponents.map((user) => {
                return (
                  <Menu.Item key={user.id} onClick={() => onSetAttacker(user.id)}>
                    {user.name}
                  </Menu.Item>
                );
              })}
            </Menu>
          )}

          {action.attacker > -1 && <AttackDetails action={action} setAction={setAction} coords={coords} segmentsMap={segmentsMap} attacksSet={attacksSet} />}
        </div>
      </Modal.Content>
      <Modal.Actions>
        {reason && reason !== 'You must select an attacker' && <Message color="red">{reason}</Message>}
        <Button color="grey" onClick={() => setOpen(false)}>
          Cancel
        </Button>
        {edit ? (
          <>
            <Button color="red" inverted onClick={onRemove}>
              Undo Attack
            </Button>
            <Button primary disabled={!valid} onClick={onSave}>
              Save
            </Button>
          </>
        ) : (
          <Button primary disabled={!valid} onClick={onSave}>
            Save
          </Button>
        )}
      </Modal.Actions>
    </Modal>
  );
};
