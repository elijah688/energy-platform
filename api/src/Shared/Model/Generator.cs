namespace Shared.Model
{
    public record GeneratorInput(string Type, int Count);
    public record GeneratorOutput(string Type, int Count, decimal TotalKwhPerType);
    public record UserGenerators(List<GeneratorOutput> Generators, decimal TotalKwh);
    public record UserGeneratorUpdate(string GeneratorType, int Count);

}