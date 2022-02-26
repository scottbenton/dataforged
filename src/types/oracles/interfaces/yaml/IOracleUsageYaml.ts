
import IRequirementsData from "../../../general/interfaces/IRequirementsData";
import ISuggestionsData from "../../../general/interfaces/ISuggestionsData";

export default interface IOracleUsageYaml {
  Initial?: boolean | undefined;
  Suggestions?: ISuggestionsData | undefined;
  Requires?: IRequirementsData | undefined;
  "Min rolls"?: number | undefined;
  "Max rolls"?: number | undefined;
  Repeatable?: boolean | undefined;
}
