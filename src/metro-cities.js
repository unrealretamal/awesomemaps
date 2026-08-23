// Major urban rail systems. Keys match Nominatim city/search/label values.
// Fallback marks remain when Wikimedia Commons has no reusable logo asset.
export const CITY_TRANSIT = Object.fromEntries([
  ["london", "roundel"], ["greater london", "roundel"], ["paris", "M"], ["new york", "NYC"],
  ["tokyo", "M"], ["東京都", "M"], ["berlin", "U"], ["madrid", "M"],
  ["barcelona", "M"], ["lisboa", "M"], ["lisbon", "M"], ["rome", "M"],
  ["roma", "M"], ["milan", "M"], ["milano", "M"], ["vienna", "U"],
  ["wien", "U"], ["prague", "M"], ["praha", "M"], ["budapest", "M"],
  ["warsaw", "M"], ["warszawa", "M"], ["amsterdam", "M"], ["brussels", "M"],
  ["bruxelles", "M"], ["copenhagen", "M"], ["stockholm", "T"], ["oslo", "T"],
  ["helsinki", "M"], ["dublin", "DART"], ["zurich", "S"], ["zürich", "S"],
  ["munich", "U"], ["münchen", "U"], ["hamburg", "U"], ["frankfurt", "U"],
  ["athens", "M"], ["istanbul", "M"], ["moscow", "M"], ["kyiv", "M"],
  ["bucharest", "M"], ["sofia", "M"], ["belgrade", "BG"], ["zagreb", "ZET"],
  ["dubai", "M"], ["doha", "M"], ["riyadh", "M"], ["cairo", "M"],
  ["tel aviv", "R"], ["delhi", "M"], ["mumbai", "M"], ["kolkata", "M"],
  ["bengaluru", "M"], ["chennai", "M"], ["hyderabad", "M"], ["bangkok", "M"],
  ["singapore", "MRT"], ["kuala lumpur", "MRT"], ["jakarta", "MRT"], ["manila", "MRT"],
  ["hong kong", "MTR"], ["beijing", "M"], ["shanghai", "M"], ["guangzhou", "M"],
  ["shenzhen", "M"], ["seoul", "M"], ["taipei", "MRT"], ["osaka", "M"],
  ["kyoto", "M"], ["nagoya", "M"], ["sapporo", "M"], ["fukuoka", "M"],
  ["sydney", "T"], ["melbourne", "T"], ["brisbane", "T"], ["perth", "T"],
  ["auckland", "AT"], ["toronto", "TTC"], ["montreal", "M"], ["montréal", "M"],
  ["vancouver", "T"], ["chicago", "L"], ["boston", "T"], ["washington", "M"],
  ["san francisco", "BART"], ["los angeles", "M"], ["seattle", "L"], ["philadelphia", "SEPTA"],
  ["miami", "M"], ["atlanta", "MARTA"], ["mexico city", "M"], ["ciudad de méxico", "M"],
  ["guadalajara", "SITEUR"], ["monterrey", "M"], ["são paulo", "M"], ["rio de janeiro", "M"],
  ["buenos aires", "S"], ["santiago", "M"], ["lima", "M"], ["bogotá", "TM"],
  ["medellín", "M"], ["caracas", "M"], ["panama city", "M"], ["santo domingo", "M"],
  ["san juan", "TU"], ["cape town", "T"], ["johannesburg", "G"], ["lagos", "LRMT"],
  ["nairobi", "NCR"], ["casablanca", "T"], ["algiers", "M"], ["tunis", "M"],
  ["addis ababa", "LRT"],
]);

export const normalizePlace = (value) => String(value || "")
  .toLocaleLowerCase()
  .normalize("NFD")
  .replace(/[\u0300-\u036f]/g, "")
  .trim();
