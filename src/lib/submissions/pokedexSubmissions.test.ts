import { buildTestPost } from "../posts";
import { pokedexSubmissionsHandler } from "./pokedexSubmissions";

test("Minimal submission", () => {
  const post = buildTestPost({
    message: `Final Submission
    
    Koffing, the Poison Gas Pokemon
    
    Sword: Because it stores several kinds of toxic gases in its body, it is prone to exploding without warning.
    
    Shield: It adores polluted air. Some claim that Koffing used to be more plentiful in the Galar region than they are now. 
    `,
  });

  const result = pokedexSubmissionsHandler.parseSubmission(post);

  expect(result.submission).not.toBeNull();
});

test("Overly-long submission", () => {
  const post = buildTestPost({
    message: `Final Submission
    
    Koffing, the Poison Gas Pokemon
    
    Omega Ruby: If Koffing becomes agitated, it raises the toxicity of its internal gases and then jets them out from all over its body. This Pokémon may also overinflate its round body, then explode.
    
    Alpha Sapphire: Koffing embodies toxic substances. It mixes the toxins with raw garbage to set off a chemical reaction that results in a terribly powerful Poison Gas. The higher the temperature, the more gas is concocted by this Pokémon.
    `,
  });

  const result = pokedexSubmissionsHandler.parseSubmission(post);

  expect(result.submission).toBeNull();
});
