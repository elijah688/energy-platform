using System.Collections.Generic;
using System.Text.Json.Serialization;

namespace Shared.Model
{
    public record GeneratorInput(
        [property: JsonPropertyName("type")] string Type,
        [property: JsonPropertyName("count")] int Count
    );

    public record GeneratorOutput(
        [property: JsonPropertyName("type")] string Type,
        [property: JsonPropertyName("count")] int Count,
        [property: JsonPropertyName("totalKwhPerType")] decimal TotalKwhPerType
    );

    public record UserGenerators(
        [property: JsonPropertyName("generators")] List<GeneratorOutput> Generators,
        [property: JsonPropertyName("totalKwh")] decimal TotalKwh
    );

    public record UserGeneratorUpdate(
        [property: JsonPropertyName("generatorType")] string GeneratorType,
        [property: JsonPropertyName("count")] int Count
    );

    public record GeneratorType(
        [property: JsonPropertyName("typeKey")] string TypeKey,
        [property: JsonPropertyName("label")] string Label,
        [property: JsonPropertyName("icon")] string Icon,
        [property: JsonPropertyName("productionRateKwh")] decimal ProductionRateKwh
    );
}
