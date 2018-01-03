import FormatConverter, {CharacterClass} from './FormatConverter';

it('test allowConsecutive', () => {
  let key = '12313421353123431234233343123423423';

  const f = FormatConverter.create({
    allowedCharacters: CharacterClass.DIGITS,
    allowConsecutive: false
  });

  expect(f.randomStringFromKey(key)).toEqual("243616765837");
});
it('test allowDuplicates', () => {
  let key = '12313421353123431234233343123423423';

  const f = FormatConverter.create({
    allowedCharacters: CharacterClass.LOWERCASE,
    allowDuplicates: false
  });

  expect(f.randomStringFromKey(key)).toEqual("pcudjhktaloz");
});

it('test create 1', () => {
  const f = FormatConverter.create();
  expect(f.toHex())
  .toEqual("0x01000000000c000703000000000000000000000000");
});

it('test create 2', () => {
  const f = FormatConverter.create({
    length: 4
  });
  expect(f.toHex())
  .toEqual("0x010000000004000703000000000000000000000000");
});

it('test create 2', () => {
  const f = FormatConverter.create({
    allowConsecutive: false,
    startsWith: '$|abc',
    length: 16
  });
  expect(f.toHex())
  .toEqual("0x010000000010000702247c61626300000000000000");
});

it('test fromHex', () => {
  const h1 = "0x010000000010000702247c61626300000000000000";
  expect(FormatConverter.fromHex(h1).toHex())
  .toEqual(h1);
  const h2 = "0x010000000004000703000000000000000000000000";
  expect(FormatConverter.fromHex(h2).toHex())
  .toEqual(h2);


});
