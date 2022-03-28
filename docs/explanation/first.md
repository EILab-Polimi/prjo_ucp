# Drupal 8


# Group module
Per la nuova piattaforma inseriamo il modulo [group](https://www.drupal.org/project/group) in modo da poter gestire gli accessi allo stesso tipo di content type/entity in base ai permessi dati all'utente


Al link http://local.d8mapping.it/admin/group/types troviamo la lista dei group types, nella colonna OPERATIONS troviamo i tab per gestire le Permissions realitive ad ogni group type

- At the _Content_ tab is possible to select, enable the entities/content types that can be added to this group type.
  This is mandatory to set _Permissions_ on the relative tab for give access to users to specific entities/content types

- At the _Permissions_ tab well'se the checkboxes related to the entities enabled

- At the _Roles_ tab we can define new roles for the group type

Example of our usecase

Galeb dd group (gid 4) is a water stream provider group type.

Once enbled the water request and water offer for this group type at the _Content_ tab then we preoceed to the _Permissions_ tab to set the MEMBER permissions

http://local.d8mapping.it/admin/group/types/manage/water_stream_provider/permissions

Now if we enable the

> Access group node overview
Access the overview of all group nodes, regardless of node type

For the MEMBER then when pointing at

http://local.d8mapping.it/galeb == http://local.d8mapping.it/group/4

A MEMBER will have the _Nodes_ tab that is provided from the Group module view **Group Nodes**

At this tab the user can view a Lists all of the nodes that have been added to a group

Plus the buttons to add new content (and add existing content) to the group

When adding a new content the deafult `form.html.twig` template is called.

Since we want to customize the template we have to override it [see Nodes in edit mode](/technical/theme?id=nodes-in-edit-mode)

> See Drupal8.md - Nodes in edit mode
> see commit 5c5d9134903e9ed9e138ab1fabeca608f360acde on sb_admin


- _Come visualizzare il gruppo a cui appartiene lo user ?_
  taken from https://www.drupal.org/project/group/issues/2829632
  Aggiunta la view dal file `my-groups_0.txt` aggiunge un tab al user/% con una lista dei gruppi a cui appartiene lo user

- _Come aggiungere un content al gruppo?_
  When you choose to create group content, you may create the group content entity itself, or also create the connected entity.
  [Views Add Button: Group](https://www.drupal.org/project/views_add_button_group) modulo scritto da laboratory.mike che è quello di niobi

- _Come visualizzare i contenuti per gruppo e per user?_
  https://www.drupal.org/project/group/issues/2793631
  Forse è possibile gestire tutto da una view di tipo content
