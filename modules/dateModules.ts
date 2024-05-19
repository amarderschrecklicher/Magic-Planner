export function getCurrentDate() {
  var d = new Date(),
    month = "" + (d.getMonth() + 1),
    day = "" + d.getDate(),
    year = d.getFullYear();

  if (month.length < 2) month = "0" + month;
  if (day.length < 2) day = "0" + day;

  return [year, month, day].join("-");
}

export function todayTask(taskDate:any) {
  if (taskDate == getCurrentDate()) return true;
  else return false;
}

export function compareTimes(a:any, b:any) {
  if (a.dueTime > b.dueTime) return 1;
  else if (a.dueTime < b.dueTime) return -1;
  
  return 1;
}
