export default function(data) {
  console.log('sort')
  return(data.sort(
    function(a,b){
      var nameA = a.SerialNumber ? a.SerialNumber.toUpperCase() : "";
      var nameB = b.SerialNumber ? b.SerialNumber.toUpperCase() : "";
      if (nameA < nameB) {
        return -1;
      }
      if (nameA > nameB) {
        return 1;
      }
      return 0;
    }
  ));
}
