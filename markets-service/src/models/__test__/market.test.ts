import { Market } from '../market';

it('implements optimistic concurrency control', async () => {
  // Create an instance of a market
  const market = Market.build({
    name: 'PSE',
    userId: '1',
  });

  // Save the ticket to the database
  await market.save();

  // Fetch the ticket twice
  const firstInstance = await Market.findById(market.id);
  const secondInstance = await Market.findById(market.id);

  // Make two separate changes to the tickets we fetched
  firstInstance!.set({ name: 'PSE BPI' });
  secondInstance!.set({ name: 'PSE COL' });

  // Save the first fetched ticket
  await firstInstance!.save();

  // Save the second fetched ticket and expect an error
  try {
    await secondInstance!.save();
  } catch (err) {
    return;
  }

  throw new Error('Should not reach this point');
});

it('increments the version number on multiple saves', async() => {
  const market = Market.build({
    name: 'PSE',
    userId: '1',
  });

  await market.save();
  expect(market.version).toEqual(0);
  await market.save();
  expect(market.version).toEqual(1);
  await market.save();
  expect(market.version).toEqual(2);

});
