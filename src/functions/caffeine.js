const { app } = require('@azure/functions');

app.http('caffeine', {
    methods: ['GET', 'POST'],
    authLevel: 'anonymous',
    handler: async (request, context) => {
        const brewedCoffeeCaf = 95; //in mg
        const espressoCaf = 125;
        const energySmallCaf = 80;
        const energyLargeCaf = 160;

        const toxicPerWeight = 51; //mg/kg
        const lethalPerWeight = 192;

        let data;
        try {
            data = await request.json();
        } catch (error) {
            context.log('Could not load json');
        }

        //const name = request.query.get('name') || await request.text() || 'world';
        const weight = request.query.get('weight') || (data ? data.weight : null);
        if (!weight) return { body: 'No data weight defined!'};

        const coffee = request.query.get('coffee') || (data ? data.coffee : null);
        const espresso = request.query.get('espresso') || (data ? data.espresso : null);
        const latte = request.query.get('latte') || (data ? data.latte : null);
        const cappu = request.query.get('cappuccino') || (data ? data.cappuccino : null);
        const energySmall = request.query.get('energySmall') || (data ? data.energySmall : null);
        const energyLarge = request.query.get('energyLarge') || (data ? data.energyLarge : null);

        let espressoAll = 0;
        if (espresso) espressoAll += espresso;
        if (latte) espressoAll += latte;
        if (cappu) espressoAll += cappu;

        let cafConsumed = espressoAll * espressoCaf; //in mg
        if (coffee) cafConsumed += coffee * brewedCoffeeCaf;
        if (energySmall) cafConsumed += energySmall * energySmallCaf;
        if (energyLarge) cafConsumed += energyLarge * energyLargeCaf;

        let toxic = toxicPerWeight * weight; //in mg
        let lethal = lethalPerWeight * weight;

        if (cafConsumed >= lethal) return { body: 'Why are you still alive?'};
        
        let isToxic = (cafConsumed >= toxic) ? true : false;

        let tillToxic = isToxic ? null : toxic - cafConsumed;
        let tillLethal = lethal - cafConsumed;

        let remainingCoffeeTillToxic = tillToxic ? Math.floor(tillToxic / brewedCoffeeCaf) : -1;
        let remainingEspressoTillToxic = tillToxic ? Math.floor(tillToxic / espressoCaf) : -1;
        let remainingEnergySTillToxic = tillToxic ? Math.floor(tillToxic / energySmallCaf) : -1;
        let remainingEnergyLTillToxic = tillToxic ? Math.floor(tillToxic / energyLargeCaf) : -1;

        let remainingCoffeeTillLethal = Math.floor(tillLethal / brewedCoffeeCaf);
        let remainingEspressoTillLethal = Math.floor(tillLethal / espressoCaf);
        let remainingEnergySTillLethal = Math.floor(tillLethal / energySmallCaf);
        let remainingEnergyLTillLethal = Math.floor(tillLethal / energyLargeCaf);

        const response = {
            body: JSON.stringify({
                caffeineConsumed: cafConsumed,
                coffeeTillToxic: remainingCoffeeTillToxic,
                espressoTillToxic: remainingEspressoTillToxic,
                latteTillToxic: remainingEspressoTillToxic,
                cappuccinoTillToxic: remainingEspressoTillToxic,
                smallEnergyTillToxic: remainingEnergySTillToxic,
                largeEnergyTillToxic: remainingEnergyLTillToxic,
                coffeeTillLethal: remainingCoffeeTillLethal,
                espressoTillLethal: remainingEspressoTillLethal,
                latteTillLethal: remainingEspressoTillLethal,
                cappuccinoTillLethal: remainingEspressoTillLethal,
                smallEnergyTillLethal: remainingEnergySTillLethal,
                largeEnergyTillLethal: remainingEnergyLTillLethal
            }, null, 2)
        };

        return response;
    }
});
