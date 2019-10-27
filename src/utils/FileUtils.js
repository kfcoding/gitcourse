export function endWith(string,data) {
  var regex=new RegExp(`${data}$`);
  return  regex.test(string);
}

export function visitDir(fs, path){
  let itemsCurrent=[];
  const files=fs.readdirSync(path);
  files.forEach(function (child) {
    const currentPath = `${path}/${child}`;
    let node = {"path": currentPath,"title":child,"key":currentPath};
    const info=fs.statSync(currentPath);
    if (info.isDirectory()) {
      const children=visitDir(fs, currentPath);
      if(children){
        node["children"] =children;
      }
      else{
        node["isLeaf"]=true
      }
      node["type"] = "folder";
    } else {
      node["type"] = "file";
      node["isLeaf"]=true;
      if(endWith(child,".md")){
        node["language"]="markdown";
      }
      else if(endWith(child,".js")){
        node["language"]="javascript";
      }
      else if(endWith(child,".sh")){
        node["language"]="shell";
      }
      else if(endWith(child,".json")){
        node["language"]="json";
      }
      else{
        node["language"]="";
      }
    }
    itemsCurrent.push(node);
  });
  return itemsCurrent;
}